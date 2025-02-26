import { Injectable } from '@angular/core';
import *  as signalR from "@microsoft/signalr"
@Injectable({
  providedIn: 'root'
})
export class SalesSignalRService {

  private hubConnection!: signalR.HubConnection;
  
  constructor() {
    this.startConnection();
  }

  private startConnection() {
    const url : string = "https://localhost:7215/sales-hub";
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Chat SignalR bağlantısı kuruldu'))
      .catch((err) => setTimeout(() => {
        this.startConnection();
      }, 2000));

  }

  //Methods
  Test(){
    this.hubConnection.invoke("SendMessage").catch((err) => console.error(err));
  }
  receiveMessage(callback: (values : any) => void){
    this.hubConnection.on("receiveMessage", callback);
  }
}
