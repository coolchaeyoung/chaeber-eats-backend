import got from "got";
import * as FormData from "form-data";
import { Inject, Injectable } from "@nestjs/common";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { EmailVars, MailOptions } from "./mail.interfaces";

@Injectable()
export class MailService {
    constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailOptions) {}

    private async sendEmail(subject: string, template: string, emailVars: EmailVars[]) {
        const form = new FormData();
        form.append("from", `chaeber Eats<mailgun@${this.options.domain}>`);
        form.append("to", `chaeyoung2341@naver.com`);
        form.append("subject", subject);
        form.append("template", template);
        emailVars.forEach(eVar => form.append(`v:${eVar.key}`, eVar.value));
        try{
            const response = await got(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `api:${this.options.apiKey}`
                    ).toString("base64")}`
                },
                body: form,
            });
            console.log(response.body);
        } catch(error){
            console.log(error);
        }
    }

    sendVerificationEmail(email:string, code: string) {
        this.sendEmail("Verify your email", "verify-email", [
            { key: 'code', value: code },
            { key: 'username', value: email }
        ])
    }
}
