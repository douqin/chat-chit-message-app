export type OTPData = {
    otp: number;
    timeAbleReNew: number;
    target : OTPTarget
}
export enum OTPTarget {
    REGISTER = 'REGISTER',
    FORGOT_PASSWORD = 'FORGOT_PASSWORD',
    RESET_PASSWORD = 'RESET_PASSWORD'
}