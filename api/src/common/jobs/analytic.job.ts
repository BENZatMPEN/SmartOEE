import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SocketService } from '../services/socket.service';
import { OeeService } from '../../oee/oee.service';
import { SiteService } from '../../site/site.service';

@Injectable()
export class AnalyticJob {
  private readonly logger = new Logger(AnalyticJob.name);

  constructor(
    private readonly socketService: SocketService,
    private readonly oeeService: OeeService,
    private readonly siteService: SiteService,
  ) {}

  // TODO: configurable
  @Cron('0/1 * * * * *')
  async handleCron() {
    // console.log('');
    // const sites = await this.siteService.findAll();
    // sites.forEach((site) => {
    //   (async () => {
    //     const stats = await this.oeeService.findAllStatus(site.id);
    //     const siteName = `site_${site.id}`;
    //     this.socketService.socket.to(siteName).emit(`dashboard_${site.id}`, stats);
    //   })();
    // });
  }
}
