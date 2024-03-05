import { eventbus } from "@/lib/common";
import { EventNotification } from "./constant.even-bus";
import { DataEventBusNotificationReceive } from "./data-define/rc";

const eventbusNotification = new eventbus.EventEmitter();
eventbusNotification.on(EventNotification.NEW_MESSAGE, (data : DataEventBusNotificationReceive) => {
    console.log('eventbusMail', data);
});
export { eventbusNotification };