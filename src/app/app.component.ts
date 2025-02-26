import { Component, OnInit } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import Highcharts from 'highcharts';
import { SalesSignalRService } from './services/sales-signal-r.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;

  chart: Highcharts.Chart | undefined; // Chart nesnesini saklamak için
  updateFromInput = false;
  callbackFunction: (chart : any) => void;

  chartOptions: Highcharts.Options = {
    accessibility: { enabled: false },
    title: { text: "Gerçek Zamanlı Satış Verileri" },
    subtitle: { text: "Canlı Veri Akışı" },
    yAxis: { 
      title: { 
        text: "Satış Miktarı",
        style: { color: Highcharts.defaultOptions.title?.style?.color }
      } 
    },
    xAxis: { 
      type: 'linear',
      title: { 
        text: "Veri Noktaları",
        style: { color: Highcharts.defaultOptions.title?.style?.color }
      }
    },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle",
      itemStyle: { color: '#333333' }
    },
    plotOptions: {
      line: {
        marker: { enabled: false },
        animation: { duration: 300 }
      }
    },
    series: []
  };

  constructor(private signalR: SalesSignalRService) {
   
   const self = this;
   this.callbackFunction = (chart : any): void => {
      self.chart = chart;
   };
   
  }

  ngOnInit(): void {
    this.listenToSignalR();
   
  }

  private listenToSignalR(): void {
    this.signalR.receiveMessage((list: unknown) => {
      const incomingData = list as Array<{ 
        name: string; 
        data: number[] 
      }>;

      // Gelen veriyi formatla
      const formattedSeries = incomingData.map(item => ({
        type: "line" as const,
        name: item.name, // İsimleri de ekleyebilirsin
        data: item.data,
      }));
      this.updateFromInput = true;
      // Grafiği güncelle
      this.updateChart(formattedSeries);
      console.log('Gelen Veri:', list);
    });
  }

  private updateChart(seriesData: Highcharts.SeriesOptionsType[]): void {
    if (this.chart) {
      this.chart.showLoading();
      // Mevcut serileri temizle
      while (this.chart.series.length > 0) {
        this.chart.series[0].remove(false); // false: Grafiği yeniden çizme
      }

      // Yeni serileri ekle
      seriesData.forEach(series => {
        this.chart?.addSeries(series, false); // false: Grafiği yeniden çizme
      });

      // Grafiği yeniden çiz
      this.chart.redraw();
      this.chart.hideLoading();
    }
  }

  // // Highcharts chart callback
  // callbackFunction(chart: Highcharts.Chart): void {
  //   this.chart = chart; // Chart nesnesini sakla
  // }
}