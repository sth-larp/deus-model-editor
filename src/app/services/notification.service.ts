import { Injectable, ViewContainerRef } from '@angular/core';
import { ToastsManager, Toast, ToastOptions } from 'ng2-toastr/ng2-toastr';


export class DmeToastOptions extends ToastOptions {
  animate = 'flyRight';
  newestOnTop = true;
  showCloseButton = true;
  toastLife = 10000;
  maxShown = 10;
  positionClass = "toast-bottom-right";
}


@Injectable()
export class NotificationService {

    private _rootContainer: ViewContainerRef = null;

    set rootViewContainer(vcr: ViewContainerRef){
        this._rootContainer = vcr;
        this.toastr.setRootViewContainerRef(vcr);
    }

    get rootViewContainer() : ViewContainerRef{
        return this._rootContainer;
    }

    constructor(public toastr: ToastsManager) { }

    success(message: string, title: string = "Success!", component = ""){
        this.toastr.success(message, title);
        this.log(message, "INFO", component);
    }

    error(message: string, title: string = "Error!", component = ""){
        this.toastr.error(message, title);
        this.log(message, "ERROR", component);
    }

    warning(message: string, title: string = "Warning!", component = ""){
        this.toastr.warning(message, title);
        this.log(message, "WARNING", component);
    }

    info(message: string, title: string = "Information!", component = ""){
        this.toastr.warning(message, title);
        this.log(message, "INFO", component);
    }

    private log(message: string, title: string, component: string){
        console.log(`${component}  ${title}: ${message}`);
    }
}
