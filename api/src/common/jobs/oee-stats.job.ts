import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SocketService } from '../services/socket.service';
import { OeeService } from '../../oee/oee.service';
import { SiteService } from '../../site/site.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OeeStatsJob {
  private readonly logger = new Logger(OeeStatsJob.name);

  constructor(
    private readonly socketService: SocketService,
    private readonly oeeService: OeeService,
    private readonly siteService: SiteService,
    private readonly userService: UserService
  ) {}

  @Cron('0/1 * * * * *')
  async handleCron() {
    const sites = await this.siteService.findAll();
    sites.forEach((site) => {
      (async () => {
        const users = await this.userService.findAll(site.id);
        const siteName = `site_${site.id}`;
        users.forEach(async (user) => {
          const stats = await this.oeeService.findAllStatus(site.id, user.id);
          this.socketService.socket.to(siteName).emit(`dashboard_${site.id}_${user.id}`, stats);
        });
        const stats = await this.oeeService.findAllStatus(site.id);
        this.socketService.socket.to(siteName).emit(`dashboard_${site.id}`, stats);
      })();
    });
  }
}
