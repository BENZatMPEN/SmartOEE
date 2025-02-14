import { Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import configuration from '../../configuration';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class LineNotifyService {
  private readonly logger = new Logger(LineNotifyService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(configuration.KEY)
    private readonly config: ConfigType<typeof configuration>,
  ) {}

  async send(message: string, token: string): Promise<void> {
    try {
      const form = new FormData();
      form.append('message', message);

      await this.httpService
        .post(this.config.lineApiUrl, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .subscribe(
          (response) => {
            // console.log(response.data);
          },
          (error) => {
            // console.log(error);
          },
        );
    } catch (err) {
      // console.log(err);
    }
  }
}
