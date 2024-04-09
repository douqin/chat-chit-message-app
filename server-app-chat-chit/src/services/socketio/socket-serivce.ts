import { Observable, Subject } from "rxjs";
import { injectable } from "tsyringe";

@injectable()
export class SocketIoService {
  private subject = new Subject<{ name: string; data: unknown }>();
  addEvent(eventName: string, eventData: unknown): void {
    this.subject.next({ name: eventName, data: eventData });
  }
  getEventSubject$(): Observable<{ name: string; data: unknown }> {
    return this.subject.asObservable();
  }
}
