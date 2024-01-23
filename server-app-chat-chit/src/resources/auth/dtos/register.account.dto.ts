import { RefinementCtx, ZodIssueCode, z } from "zod";
import Gender from "../enums/gender.enum";

const RegisterAccountDTOSchema = z.object({
  firstname: z.string().min(10).max(100),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
  phone: z.string().min(10).max(15),
  address: z.string().min(10).max(100).optional(),
  lastname: z.string().min(10).max(100),
  gender: z.nativeEnum(Gender),
  birthday: z.string().transform((value: string, ctx: RefinementCtx) => {
    let date = new Date(value);
    if (date) {
      return date;
    }
    ctx.addIssue({
      code: ZodIssueCode.invalid_date,
      message: "birthday is invalid",
      path: [],
    });
    return z.NEVER;
  }),
})

type RegisterAccountDTO = z.infer<typeof RegisterAccountDTOSchema>;
export { RegisterAccountDTOSchema, RegisterAccountDTO };
