
import { HttpStatus } from "@/utils/extension/httpstatus.exception"
import MotherController from "@/utils/interface/controller.interface"
import { ServiceFCM } from "../../component/firebase/firebase.service"
import multer from "multer"

export default class TestController extends MotherController{
    initRouter(): MotherController {
        this.router.post("/test/testnoti",
        multer().none(),
         async (req, res, next) =>{
            try{
                await ServiceFCM.gI().sendNotification(
                    "test noti",
                    req.body.noti
                )
                res.status(HttpStatus.OK).send({
                    "noti KEY" : req.body.noti 
                })

            }
            catch(e){
                console.log(e)
                res.status(HttpStatus.OK).send({
                    "noti KEY" : req.body.noti 
                })
            }
        })
        return this;
    }
}