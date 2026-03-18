import {setGlobalOptions} from "firebase-functions";
import * as admin from "firebase-admin";

import {sendScheduledMessages} from "./jobs/sendScheduledMessages";

setGlobalOptions({maxInstances: 10});

admin.initializeApp();

export {sendScheduledMessages};
