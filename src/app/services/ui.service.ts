import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class UIService {
  constructor(private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController) {

  }

  public async showLoading(msg?: string): Promise<HTMLIonLoadingElement> {
    const loader = await this.loadingController.create({
      message: msg || 'loading...',
    });
    await loader.present();
    return loader;
  }


  public async showSimpleAlert(msg: string, heading?: string): Promise<void> {
    const alert = await this.alertController.create({
      header: heading || 'Alert',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

  public async showAlertWithDismissCallback(heading: string, msg: string, btnText: string, callback: Function): Promise<void> {
    const alert = await this.alertController.create({
      header: heading,
      message: msg,
      buttons: [
        {
          text: btnText,
        }
      ]
    });
    await alert.present();
    alert.onDidDismiss().then(() => { callback(); });
  }

  public async showToast(msg: string, duration?: number): Promise<HTMLIonToastElement> {
    const toast = await this.toastController.create({
      message: msg,
      color: 'dark',
      duration: duration || 2000
    });
    toast.present();
    return toast;
  }
}

