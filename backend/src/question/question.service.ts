import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch.service';
import { Data } from 'src/entities/data.entity';
import { Lecture } from 'src/entities/lecture.entity';
import { User } from 'src/entities/user.entity';
import RelationMapper from 'src/util/util.service';
import { MongoRepository } from 'typeorm';

@Injectable()
export class QuestionService {
  private readonly LOGGER = new Logger(QuestionService.name);

  constructor(
    @InjectRepository(Data) private readonly dataRepo: MongoRepository<Data>,
    @InjectRepository(Lecture) private readonly lectureRepo: MongoRepository<Lecture>,
    @InjectRepository(User) private readonly userRepo: MongoRepository<Lecture>,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly relationMapper: RelationMapper
  ) {
    this.LOGGER.debug('Setting up Elastic Search');
    this.elasticsearchService.isQuestionIndex().then(isIndex => {
      this.getQuestions().then(questions => {
        this.LOGGER.debug('Synchronizing Elastic Search with Database');
        if (!isIndex) {
          this.elasticsearchService.createQuestionIndex().then(() => {
            this.elasticsearchService.indexQuestions(questions).then(() => {
              this.LOGGER.debug('Elastic Search initialized');
            });
          });
        } else {
          this.elasticsearchService.indexQuestions(questions).then(() => {
            this.LOGGER.debug('Elastic Search initialized');
          });
        }
      });
    });
  }

  public getQuestions(q: string | null = null) {
    if (q) {
      return this.elasticsearchService.searchQuestions(q);
    }
    return this.dataRepo.find();
  }

  public getQuestionById(_id: string) {
    return this.dataRepo.findOne(_id);
  }

  public async createQuestion(question: Data) {
    try {
      const q = await this.relationMapper.createRelation(question, 'lecture', Lecture);
      await this.elasticsearchService.createQuestion(q);

      return this.dataRepo.save(q);
    } catch {
      throw new HttpException('Creation failed', HttpStatus.NOT_ACCEPTABLE);
    }
  }

  public async updateQuestion(_id: string, question: Data) {
    try {
      const q = await this.relationMapper.createRelation(question, 'lecture', Lecture);
      await this.elasticsearchService.updateQuestion(_id, question);

      await this.dataRepo.update(_id, q);
      return this.dataRepo.findOne(_id);
    } catch {
      throw new HttpException('Update failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async deleteQuestion(_id: string) {
    try {
      await this.elasticsearchService.deleteQuestion(_id);

      await this.dataRepo.delete(_id);
      return { deleted: true };
    } catch {
      throw new HttpException('Deletion failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}