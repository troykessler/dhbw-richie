import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Question } from '../models/question.model';

const backend_url =
  'https://raw.githubusercontent.com/TimoScheuermann/cdn/master/DHBW%20Richie';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  constructor(private readonly http: HttpClient) {}

  public getQuestionById(id: string = '') {
    return this.http
      .get<Question>(`${environment.backend}/api/question/${id}`)
      .pipe(map(x => plainToClass(Question, x)))
      .toPromise();
  }

  public searchForKeyword(keyword: string = '') {
    return this.http
      .get<Question[]>(`${environment.backend}/api/question`, {
        params: {
          q: keyword
        }
      })
      .pipe(map(qs => qs.map(q => plainToClass(Question, q))));
  }

  public addQuestion(question: Question) {
    return this.http
      .post<Question>(`${environment.backend}/api/question`, question)
      .pipe(map(x => plainToClass(Question, x)))
      .toPromise();
  }

  public getReactedQuestions() {
    return this.http
      .get<{ likedQuestions: Question[]; dislikedQuestions: Question[] }>(
        `${environment.backend}/api/question/reacted`
      )
      .pipe(
        map(x => {
          return {
            likedQuestions: x.likedQuestions.map(q => plainToClass(Question, q)),
            dislikedQuestions: x.dislikedQuestions.map(q => plainToClass(Question, q))
          };
        })
      )
      .toPromise();
  }

  public likeOrDislikeQuestion(questionId: string, type: 'like' | 'dislike') {
    return this.http
      .get<Question>(`${environment.backend}/api/question/${questionId}/${type}`)
      .pipe(map(x => plainToClass(Question, x)))
      .toPromise();
  }
}
