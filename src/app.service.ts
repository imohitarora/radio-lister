import { Injectable } from '@nestjs/common';
import { RadioBrowserApi } from 'radio-browser-api';
import { writeFileSync, readFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable()
export class AppService {
  constructor(private readonly httpService: HttpService) {}

  api = new RadioBrowserApi('My Radio App');

  async getHello() {
    let hlsChannels = 0;
    const stations = await this.api.searchStations({
      language: 'hindi',
    });

    const punjabiStations = await this.api.searchStations({
      language: 'punjabi',
    });

    stations.push(...punjabiStations);
    const customChannels = [];
    stations.forEach((station) => {
      if (
        station.url &&
        station.url.includes('https://') &&
        !customChannels.find((channel) => channel.url === station.url)
      ) {
        customChannels.push({
          channelid: station.id,
          name: station.name,
          url: station.url,
          meta: (
            station.country +
            '-' +
            station.language.join('-')
          ).toUpperCase(),
        });
        hlsChannels++;
      }
    });
    console.log(customChannels);
    writeFileSync('new_channels.json', JSON.stringify(customChannels, null, 2));
    return `Hello World! Found ${hlsChannels} stations.`;
  }

  async filterMyChannels() {
    const favourited = [
      '60sforever',
      '9xm',
      'Aaj Tak News Radio Live',
      'AIR News 24/7',
      'Apna 990 AM',
      'arijitsingh',
      'Asian Star Radio',
      'asianfx',
      'bbcasiannetwork',
      'Bolly 102.9 FM',
      'bolly923fm',
      "Bollywood 2010's",
      'bollywoodandbeyond',
      'bollywooddance',
      'bollywoodmix',
      'Bombay Beats Radio',
      'CHAH "My Radio 580" Edmonton, AB',
      'cinaradio',
      'city92fm',
      'Club Asia Radio',
      'CMR Hindi FM Radio',
      'desimaska',
      'dholradio',
      'Diverse FM',
      'exclusivebollywood',
      'FM 24 Bhiwadi 90.8',
      'Fusion Life Radio',
      'Gazal',
      'Gazal Radio London',
      'GuruBox Satsang',
      'Himal Radio',
      'Hindi Gold Radio',
      'Hum FM Radio',
      'Ishq Fm',
      'kadakfm',
      'Lotus FM',
      'Masala Radio',
      'meethimirchi',
      "Michi 90's Radio",
      'Mirchi - Yo Punjabi',
      'Mirchi Bay Area',
      'Mirchi FM Fiji',
      'Mirchi Love Hindi',
      'Mirchi New Jersey',
      'Mirchi One 89.6 Qatar',
      'mirchi90sradio',
      'Radio 90.5 FM',
      'Radio Aashiqanaa ',
      'Radio Bula Masti',
      'Radio Caravan',
      'Radio Central 24',
      'Radio Chahat',
      'Radio Dehotties',
      'Radio Dhoom',
      'Radio Gyansthali 89.6 FM',
      'Radio Hind',
      'Radio Maharani',
      'Radio Mirchi Hindi',
      'Radio Olive',
      'Radio Olive Retro',
      'Radio Sajawat',
      'Radio SBS',
      'Radio SD 90.8 FM',
      'Radio Spice 104.9 FM',
      'Radio Udaan',
      'Radio Zindagi',
      'radiobollyfm',
      'radiotarana',
      'Roq Raw Radio',
      'Sangeet 106.1 FM',
      'Sangeet Radio FM 95.1 AM 1460 Houston, TX, US',
      'Sayaji FM',
      'shreyaghosal',
      'Shuddh Desi Radio',
      'Sitara FM',
      'Spice Radio Toronto',
      'Suno Sharda - 90.8FM',
      'unity101',
      'Vividh Bharti Mumbai',
      'Bol Punjabi Radio',
      'Bollywood Punjabi Radio',
      'BritAsia Radio Punjabi',
      'CIRF-AM 1350 "Radio Humsafar" Brampton, ON',
      'CJSA-HD4 CMR Diversity FM 101.3 (Punjabi Stream) Toronto, ON',
      'Desi World Radio (HQ)',
      'doabaradio',
      'dreamzzpunjabiradio',
      'harmanradio',
      'radiopunjabiusa',
      'RED FM Toronto 88.9 FM',
      'saddaradio',
      'srgumradio',
    ];

    try {
      const data = readFileSync('new_channels.json', 'utf8');
      const channels = JSON.parse(data);
      const filteredChannels = channels.filter((channel) =>
        favourited.includes(channel.name),
      );
      writeFileSync(
        'favourite_channels1.json',
        JSON.stringify(filteredChannels),
      );
    } catch (err) {
      console.log(err);
    }
  }

  async getChannelById() {
    const channel = await this.api.searchStations({
      name: 'AIR Amaravati',
    });
    console.log(channel);
    return channel;
  }

  async cleanNameJson() {
    try {
      // channel_clean_names.json  && favourite_channels1.json both have id common field
      const data = readFileSync('channel_clean_names.json', 'utf8');
      const channels = JSON.parse(data);
      const data1 = readFileSync('favourite_channels1.json', 'utf8');
      const favChannels = JSON.parse(data1);
      const cleanedChannels = channels.map((channel) => {
        const favChannel = favChannels.find(
          (favChannel) => favChannel.channelid === channel.id,
        );
        if (favChannel) {
          delete favChannel.channelid;
          return {
            ...favChannel,
            name: channel.name,
          };
        }
        return channel;
      });
      writeFileSync(
        'channel_clean_names1.json',
        JSON.stringify(cleanedChannels),
      );
    } catch (err) {
      console.log(err);
    }
  }

  async getLanguageChannelsList() {
    const limit = 500;
    const hindiChannelApiURL = `https://at1.api.radio-browser.info/json/stations/search?limit=${limit}&language=hindi&hidebroken=true&order=clickcount&reverse=true`;
    const punjabiChannelApiURL = `https://at1.api.radio-browser.info/json/stations/search?limit=${limit}&language=punjabi&hidebroken=true&order=clickcount&reverse=true`;

    const hindiRequest = this.httpService.get(hindiChannelApiURL);
    const punjabiRequest = this.httpService.get(punjabiChannelApiURL);

    return forkJoin([hindiRequest, punjabiRequest])
      .pipe(
        map(([hindiData, punjabiData]) => {
          // Filter, sort, and transform each set of data
          const transformAndSort = (data) =>
            data
              .filter((item) => item.url.startsWith('https'))
              .sort((a, b) => b.votes - a.votes) // Sorting in descending order by votes
              .map((item) => ({
                stationuuid: item.stationuuid,
                name: item.name,
                url: item.url,
                language: item.language,
                countrycode: item.countrycode,
                favicon: item.favicon,
                votes: item.votes, // Including votes in the output
              }));

          const filteredHindi = transformAndSort(hindiData.data);
          const filteredPunjabi = transformAndSort(punjabiData.data);

          return [...filteredHindi, ...filteredPunjabi];
        }),
      )
      .toPromise()
      .then((data) => {
        // Write the filtered, sorted, and transformed data to a JSON file
        writeFileSync(
          'filteredSortedRadioChannels.json',
          JSON.stringify(data, null, 2),
          'utf8',
        );
        return data;
      });
  }

  countUniqueProdDataEntries() {
    // Read and parse the filtered radio channels data
    const filteredRadioChannels = JSON.parse(
      readFileSync('filteredRadioChannels.json', 'utf8'),
    );
    // Read and parse the product data
    const prodData = JSON.parse(readFileSync('proddata.json', 'utf8'));

    // Create a set of URLs from the filtered radio channels for quick lookup
    const channelUrls = new Set(
      filteredRadioChannels.map((channel) => channel.url),
    );

    // Filter prodData to find entries not in filteredRadioChannels
    const uniqueProdData = prodData.filter(
      (item) => !channelUrls.has(item.url),
    );

    writeFileSync(
      'uniqueProdData.json',
      JSON.stringify(uniqueProdData, null, 2),
      'utf8',
    );

    // Print the count of unique entries
    console.log(`Count of unique prodData entries: ${uniqueProdData.length}`);
  }

  readJsonFile(filePath) {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  }

  // Main function to merge data
  async mergeData() {
    const radioChannels = this.readJsonFile('filteredSortedRadioChannels.json');
    const prodData = this.readJsonFile('proddata.json');

    // Convert prodData to a map for quick URL lookup
    const prodDataMap = new Map(prodData.map((item) => [item.url, item.name]));

    // Merge data
    const mergedData = radioChannels.map((channel) => {
      if (prodDataMap.has(channel.url)) {
        return { ...channel, name: prodDataMap.get(channel.url) }; // Replace name if URL matches
      }
      return channel; // Otherwise, keep original channel data
    });

    // Write the merged data to a new JSON file
    writeFileSync(
      'mergedRadioChannels.json',
      JSON.stringify(mergedData, null, 2),
      'utf8',
    );
  }

  async names() {
    try {
      const data = readFileSync('channel_names_clean_data1.json', 'utf8');
      const channels = JSON.parse(data);
      const channelNames = channels.map((channel) => {
        const parts = channel.meta.split('-');
        return {
          id: channel.id,
          name: channel.name,
          url: channel.url,
          country: parts.shift(),
          meta: parts.join('-'),
        };
      });
      writeFileSync(
        'channel_names_clean_data2.json',
        JSON.stringify(channelNames, null, 2),
      );
    } catch (err) {
      console.log(err);
    }
  }

  formatName(name) {
    // Handle specific patterns and known issues
    name = name
      .replace(/retrobollywood/gi, 'Retro Bollywood')
      .replace(/fnffmbollywood/gi, 'Fnfm Bollywood')
      .replace(/digitalsound/gi, 'Digital Sound')
      .replace(/(radio|fm|hits|air)(\d+)/gi, '$1 $2') // Separate numbers from words
      .replace(/(\d+)(fm|radio|hits|air)/gi, '$1 $2') // Separate numbers from words
      .replace(/fm/gi, 'FM') // Capitalize FM everywhere
      .replace(/air/gi, 'AIR') // Capitalize AIR
      .replace(/(\w)(fm|radio|air|tv)/gi, '$1 $2') // Add space before FM, Radio, AIR, TV
      .replace(/(fm|radio|air|tv)(\w)/gi, '$1 $2'); // Add space after FM, Radio, AIR, TV

    // General cleanup for capital letters and spaces
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize the first letter of each word
    name = name.toLowerCase().replace(/\b(\w)/g, (s) => s.toUpperCase());

    return name.trim(); // Remove any leading/trailing spaces
  }

  public mergeRecords(records: any[]): any[] {
    // Filter out Punjabi and other records
    const punjabiRecords = records.filter((record) =>
      record.meta.toUpperCase().includes('PUNJABI'),
    );
    const otherRecords = records.filter(
      (record) => !record.meta.toUpperCase().includes('PUNJABI'),
    );

    // Shuffle both arrays to randomize the order a bit
    const shuffledPunjabi = this.shuffleArray(punjabiRecords);
    const shuffledOther = this.shuffleArray(otherRecords);

    // Randomly decide how to merge (e.g., 2 other, 1 Punjabi, etc.)
    const mergedRecords = [];
    let otherIndex = 0,
      punjabiIndex = 0;

    while (
      otherIndex < shuffledOther.length ||
      punjabiIndex < shuffledPunjabi.length
    ) {
      const randomPattern = Math.floor(Math.random() * 3) + 1; // Randomly choosing 1, 2, or 3

      // Add 'other' records
      for (
        let i = 0;
        i < randomPattern && otherIndex < shuffledOther.length;
        i++
      ) {
        mergedRecords.push(shuffledOther[otherIndex++]);
      }

      // Add a Punjabi record
      if (punjabiIndex < shuffledPunjabi.length) {
        mergedRecords.push(shuffledPunjabi[punjabiIndex++]);
      }
    }

    return mergedRecords;
  }

  private shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }

  async shuffle() {
    try {
      const data = readFileSync('channel_names_clean_shuffle.json', 'utf8');
      const channels = JSON.parse(data);
      const mergeRecords = this.removeDuplicates(channels);
      writeFileSync(
        'channel_names_no_duplicates.json',
        JSON.stringify(mergeRecords, null, 2),
      );
    } catch (err) {
      console.log(err);
    }
  }

  removeDuplicates(records: any[]): any[] {
    const seenUrls = new Set();
    return records.filter((record) => {
      if (!seenUrls.has(record.url)) {
        seenUrls.add(record.url);
        return true;
      }
      return false;
    });
  }

  async namesAndCountry() {
    const countryCorrections = {
      'Red Fm Calgary': 'CA',
      'Red Fm Vancouver': 'CA',
      'Red Fm Toronto': 'CA',
      'Radio Humsafar Brampton': 'CA',
      'Mirchi New Jersey': 'US',
      'Mirchi Bay Area': 'US',
      'Desi World Radio (Usa)': 'US',
      'Sangeet Radio 95.1 Houston': 'US',
      'East Fm': 'KE',
      'Chah Radio Edmonton': 'CA',
      'Diversity Fm 101.3 Toronto': 'CA',
      'CJRK-FM 102.7 "East Fm" Toronto': 'CA',
      '1600 Radio Punjab': 'CA',
      'Apna 990 Am': 'NZ',
      'Indianlink Radio': 'AU',
      'Lotus Fm': 'ZA',
      'Radio Fiji2': 'FJ',
      'Radio Zindagi': 'US',
      'Krpi Ferndale 1550 Am': 'US',
      'Lyca Radio 1458 Am': 'GB', // Explicit station in the UK
      'Ujala Radio': 'NL',
      'Radio Olive Retro': 'QA',
      'Mirchi One 89.6 Qatar': 'QA',
      'Gazal Radio London': 'GB',
      'Awaz Fm': 'UK', // General pattern match for UK-based stations
      'Radio City Punjabi': 'CA', // Assuming it might be Canada given Punjabi community presence
    };

    try {
      const data = readFileSync('channel_names_no_duplicates.json', 'utf8');
      const channels = JSON.parse(data);
      const channelNameAndCountry = channels.map((channel) => {
        return {
          ...channel,
          country:
            this.correctCountryCodes(channel, countryCorrections) ||
            channel.country,
        };
      });
      writeFileSync(
        'channelNameAndCountry1.json',
        JSON.stringify(channelNameAndCountry, null, 2),
      );
    } catch (err) {
      console.log(err);
    }
  }

  normalizeName(name) {
    return name
      .toLowerCase()
      .replace(/fm/g, '') // remove 'fm'
      .replace(/radio/g, '') // remove 'radio'
      .replace(/[^\w\s]/gi, '') // remove special characters
      .replace(/\s+/g, ' ') // collapse multiple spaces to one
      .trim(); // trim leading and trailing spaces
  }

  correctCountryCodes(station, corrections) {
    for (const key in corrections) {
      if (station.name.includes(key)) {
        return corrections[key];
      }
    }
  }

  moveGovtStationsToEnd(stations, govtNames) {
    const govtKeywords = new Set(govtNames.map((name) => name.toLowerCase())); // Prepare a Set for case-insensitive comparison

    const isGovtOrSpecial = (str) => {
      str = str.toLowerCase(); // Convert to lower case for case-insensitive comparison
      // Iterate through each keyword and check if it is in the string
      for (const keyword of govtKeywords) {
        if (str.includes(keyword)) return true;
      }
      return false;
    };

    return stations.sort((a, b) => {
      // Check if station a or b is government or devotional/regional
      const isAGovtOrSpecial =
        isGovtOrSpecial(a.name) || isGovtOrSpecial(a.meta);
      const isBGovtOrSpecial =
        isGovtOrSpecial(b.name) || isGovtOrSpecial(b.meta);

      if (isAGovtOrSpecial && !isBGovtOrSpecial) {
        return 1;
      }
      if (!isAGovtOrSpecial && isBGovtOrSpecial) {
        return -1;
      }
      return 0;
    });
  }

  async sortGovtStations() {
    const govtNames = [
      'air',
      'aakashvani',
      'vividh',
      'prasar',
      'akashwani',
      'doordarshan',
      'bhajan',
      'devotional',
      'kirtan',
      'bhakti',
      'gurbaani',
    ];
    try {
      const data = readFileSync('channelNameAndCountry1.json', 'utf8');
      const channels = JSON.parse(data);
      const sortedChannels = this.moveGovtStationsToEnd(channels, govtNames);
      writeFileSync(
        'channelNameAndCountry6.json',
        JSON.stringify(sortedChannels, null, 2),
      );
    } catch (err) {
      console.log(err);
    }
  }
}
