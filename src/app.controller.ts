import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('channels')
  getChannels() {
    return this.appService.getLanguageChannelsList();
  }

  @Get('channel')
  getChannel() {
    return this.appService.getChannelById();
  }

  @Get('clean')
  getClean() {
    return this.appService.cleanNameJson();
  }

  @Get('count')
  getCount() {
    return this.appService.countUniqueProdDataEntries();
  }

  @Get('merge')
  mergeData() {
    return this.appService.mergeData();
  }

  @Get('names')
  mergeNames() {
    return this.appService.names();
  }

  @Get('shuffle')
  shuffle() {
    return this.appService.shuffle();
  }

  @Get('country')
  country() {
    return this.appService.namesAndCountry();
  }

  @Get('sortem')
  sortem() {
    return this.appService.sortGovtStations();
  }
}
