
import { IWidget } from "src/lib/types";

export class Notifications extends WidgetHelper {
  constructor(data: IWidget) {
    super(data);

    this.setupEndpoints();
  }

  /*
   *
   */
  afterStart(data: IWidget): void {
    this.settings = data.settings;
  }


  private setupEndpoints() {
    this.addPostRoute("/api/notifications/clear", this.handleEndpoint.bind(this));
  }

  /*
   *
   */
  private handleEndpoint(req: Request, res: Response) {
    this.addEmitter("BROADCAST_NOTIFICATIONS_CLEAR");
    Logger.log("[Notifications] - Success: clearing notifications.");
    this.sendResponse(res, 200, "success");
  }
}

module.exports = Notifications;
