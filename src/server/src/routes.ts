import { Request, Response } from "express";
const express = require('express')
import * as _ from 'lodash';

export const itemsRouter = express.Router();

const initiateRoutes = (SmartMirror: any) => {
  itemsRouter.post("/api/reload", async (req: Request, res: Response) => {
    try {
      SmartMirror.reloadConfig();
      SmartMirror.io.emit("BROADCAST_OPTION_SUCCESS");
      res.status(200).send("success");
    } catch (e) {
      res.status(404).send(e.message);
    };
  });

  itemsRouter.get("/api/widgets", async (req: Request, res: Response) => {
    try {
      const widgets = SmartMirror.getCustomWidgets();
      res.status(200).send(widgets);
    } catch (e) {
      res.status(404).send('Error retrieving widgets.');
    }
  });

  itemsRouter.get("/api/allwidgets", async (req: Request, res: Response) => {
    try {
      const widgets = SmartMirror.getWidgets();
      res.status(200).send(widgets);
    } catch (e) {
      console.log(e)
      res.status(404).send('Error retrieving widgets.');
    }
  });

  // update mirror power
  itemsRouter.post("/api/power", async (req: Request, res: Response) => {
    try {
      SmartMirror.updatePower(req.body.mode, true);
      SmartMirror.io.emit("BROADCAST_OPTION_SUCCESS");
      res.status(200).send('success');
    } catch (e) {
      res.status(404).send('Error switching power.');
    }
  });

  // preform update
  itemsRouter.post("/api/update", async (req: Request, res: Response) => {
    try {
      SmartMirror.preformUpdate();
      res.status(200).send('success');
    } catch (e) {
      res.status(404).send('Error Performing update.');
    }
  });


  // update monitor power
  itemsRouter.post("/api/monitor", async (req: Request, res: Response) => {
    try {
      SmartMirror.updateMonitorStatus(req.body.mode, true);
      SmartMirror.io.emit("BROADCAST_OPTION_SUCCESS");
      res.status(200).send('success');
    } catch (e) {
      res.status(404).send('Error updating monitor.');
    }
  });

// create backup route
itemsRouter.post("/api/backup",  async (req: Request, res: Response) => {
  try {
    SmartMirror.createBackup();
    SmartMirror.io.emit("BROADCAST_OPTION_SUCCESS");
    res.status(200).send('success');
  } catch (e) {
    res.status(404).send('Error updating monitor.');
  }
});

itemsRouter.post("/api/usebackup", (req, res, next) => {
  try {
    SmartMirror.useBackupConfiguration();
    SmartMirror.io.emit("BROADCAST_OPTION_SUCCESS");
    res.status(200).send('success');
  } catch (e) {
    // @ts-ignore
    Logger.log('Backup route:', e)
    res.status(404).send('Error updating monitor.');
  }
});

// external api
// itemsRouter.post("/api/webhook", (req, res, next) => {
//   console.log("[Mirror] - Got a webhook call for you!");
//   res.status(200).send('success');
// });

itemsRouter.post("/api/package", async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    if (!req.files) {
      res.status(404).send({ status: false, message: "No file uploaded" });
    } else {
      // @ts-ignore
      _.forEach(_.keysIn(req.files), (key) => {
        // @ts-ignore
        SmartMirror.saveCustomWidget(req.files[key]);
      });
    }

    res.status(200).send('[Smart Mirror] - Server respone: Import success.');
  } catch (e) {
    // @ts-ignore
    Logger.log('Package route:', e)
    res.status(404).send('Error importing package.');
  }
});


  return itemsRouter;
}

export default initiateRoutes;
