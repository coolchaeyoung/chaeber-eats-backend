import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailOptions } from './mail.interfaces';
import { MailService } from "./mail.service";

@Module({})
@Global()
export class MailModule {
    static forRoot(options: MailOptions): DynamicModule {
        return {
          module: MailModule,
          providers: [{
            provide: CONFIG_OPTIONS,
            useValue: options
          }, MailService],
          exports: [MailService],
        }
    }
}
