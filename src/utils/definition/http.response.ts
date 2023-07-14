
export class ResponseBody {
    constructor(
        public success: boolean,
        public message: string = "", 
        public data: any) {}
} 