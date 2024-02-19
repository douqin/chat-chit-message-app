export function createHtmlForEmailRegisterOtp(otp: number): string {
    return `<div style="margin:auto;max-width:600px;padding-top:50px" class="m_-6387410861182173568email-container">
    
    
    
    <table role="presentation" cellspacing="0" cellpadding="0" width="100%" align="center" id="m_-6387410861182173568logoContainer" style="background:#252f3d;border-radius:3px 3px 0 0;max-width:600px">
        <tbody><tr>
            <td style="background:#252f3d;border-radius:3px 3px 0 0;padding:20px 0 10px 0;text-align:center">
                <img src="https://ephoto360.com/share_image/2024/02/65cc1305e25ac.jpg" width="75" height="45" alt="App logo" border="0" style="font-family:sans-serif;font-size:15px;line-height:140%;color:#555555" class="CToWUd" data-bit="iit">
            </td>
        </tr>
    </tbody></table>
    
    
    <table role="presentation" cellspacing="0" cellpadding="0" width="100%" align="center" id="m_-6387410861182173568emailBodyContainer" style="border:0px;border-bottom:1px solid #d6d6d6;max-width:600px">
        <tbody><tr>
            <td style="background-color:#fff;color:#444;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px">
                <h1 style="font-size:20px;font-weight:bold;line-height:1.3;margin:0 0 15px 0">Verify your email address</h1>
                <p style="margin:0;padding:0">Thanks for starting the new Chat Chit account creation process. We want to make sure it's really you. Please enter the following verification code when prompted. If you don’t want to create an account, you can ignore this message.</p>
                <p style="margin:0;padding:0"></p>
            </td>
        </tr>
        <tr>
            <td style="background-color:#fff;color:#444;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px;padding-top:0;text-align:center">
                <div style="font-weight:bold;padding-bottom:15px">Verification code</div>
                <div style="color:#000;font-size:36px;font-weight:bold;padding-bottom:15px">${otp}</div>
                <div>(This code is valid for 10 minutes)</div>
            </td>
        </tr>
        <tr>
            <td style="background-color:#fff;border-top:1px solid #e0e0e0;color:#777;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px">
                <p style="margin:0 0 15px 0;padding:0 0 0 0">Chat Chit App will never email you and ask you to disclose or verify your password, credit card, or banking account number.</p>
            </td>
        </tr>
    </tbody></table>    
</div>`
}
export function createHtmlForEmailForgotPasswordOtp(otp: number): string {
    return `<div style="margin:auto;max-width:600px;padding-top:50px" class="m_-6387410861182173568email-container">
    
    <table role="presentation" cellspacing="0" cellpadding="0" width="100%" align="center" id="m_-6387410861182173568logoContainer" style="background:#252f3d;border-radius:3px 3px 0 0;max-width:600px">
        <tbody><tr>
            <td style="background:#252f3d;border-radius:3px 3px 0 0;padding:20px 0 10px 0;text-align:center">
                <img src="https://ephoto360.com/share_image/2024/02/65cc1305e25ac.jpg" width="75" height="45" alt="App logo" border="0" style="font-family:sans-serif;font-size:15px;line-height:140%;color:#555555" class="CToWUd" data-bit="iit">
            </td>
        </tr>
    </tbody></table>
    
    
    <table role="presentation" cellspacing="0" cellpadding="0" width="100%" align="center" id="m_-6387410861182173568emailBodyContainer" style="border:0px;border-bottom:1px solid #d6d6d6;max-width:600px">
        <tbody><tr>
            <td style="background-color:#fff;color:#444;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px">
                <h1 style="font-size:20px;font-weight:bold;line-height:1.3;margin:0 0 15px 0">OTP to reset password</h1>
                <p style="margin:0;padding:0">Thanks for using the Chat Chit service. We want to make sure it's really you. Please enter the following verification code when prompted. If you don’t want to reset password your account, you can ignore this message.</p>
                <p style="margin:0;padding:0"></p>
            </td>
        </tr>
        <tr>
            <td style="background-color:#fff;color:#444;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px;padding-top:0;text-align:center">
                <div style="font-weight:bold;padding-bottom:15px">Verification code</div>
                <div style="color:#000;font-size:36px;font-weight:bold;padding-bottom:15px">${otp}</div>
                <div>(This code is valid for 10 minutes)</div>
            </td>
        </tr>
        <tr>
            <td style="background-color:#fff;border-top:1px solid #e0e0e0;color:#777;font-family:'Amazon Ember','Helvetica Neue',Roboto,Arial,sans-serif;font-size:14px;line-height:140%;padding:25px 35px">
                <p style="margin:0 0 15px 0;padding:0 0 0 0">Chat Chit App will never email you and ask you to disclose or verify your password, credit card, or banking account number.</p>
            </td>
        </tr>
    </tbody></table>    
</div>`
}