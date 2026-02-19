
// const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx-JO6Pkc9hbVv0DMk7eX5wieiGpPRuGx8p0CjxH_CX7A8dUO1G2R7T7MRVyZ-oP6NF2w/exec';

// const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkN8VBK8emW5naCDkQooxRLncEoFRhQElFMbmp5MpzIsKntXDEvyzZ7KkcovPn6V5-jg/exec';

// /**
//  * Generates header "18-Feb" precisely for the sheet.
//  * Hardcoded timeZone ensures consistent date mapping.
//  */
// const getDateHeaderFormat = () => {
//   const now = new Date();
//   const formatter = new Intl.DateTimeFormat('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     timeZone: 'Asia/Kolkata'
//   });
//   const parts = formatter.formatToParts(now);
//   const day = parts.find(p => p.type === 'day')?.value;
//   const month = parts.find(p => p.type === 'month')?.value;
//   return `${day}-${month}`;
// };

// const getLocation = (): Promise<string> => {
//   return new Promise((resolve) => {
//     if (!navigator.geolocation) {
//       resolve("0,0");
//       return;
//     }
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         resolve(`${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`);
//       },
//       () => resolve("0,0"),
//       { enableHighAccuracy: true, timeout: 5000 }
//     );
//   });
// };

// export const appsScriptService = {
//   async saveSignIn(employeeId: string, employeeName: string): Promise<void> {
//     const locationStr = await getLocation();
//     return this.postToScript({
//       action: 'signIn',
//       employee: employeeName.trim(),
//       employeeId: employeeId,
//       location: locationStr,
//       dateHeader: getDateHeaderFormat()
//     });
//   },

//   async saveSignOut(employeeId: string, employeeName: string): Promise<void> {
//     const locationStr = await getLocation();
//     return this.postToScript({
//       action: 'signOut',
//       employee: employeeName.trim(),
//       employeeId: employeeId,
//       location: locationStr,
//       dateHeader: getDateHeaderFormat()
//     });
//   },

//   async adminMarkStatus(employeeName: string, status: string): Promise<void> {
//     return this.postToScript({
//       action: 'adminMarkLeave',
//       employee: employeeName.trim(),
//       status: status,
//       dateHeader: getDateHeaderFormat()
//     });
//   },

//   async syncSummary(): Promise<void> {
//     return this.postToScript({
//       action: 'refresh',
//       dateHeader: getDateHeaderFormat(),
//       employee: 'System'
//     });
//   },

//   async postToScript(payload: any) {
//     try {
//       await fetch(SCRIPT_URL, {
//         method: 'POST',
//         mode: 'no-cors',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });
//       console.log("GAS Sync Success:", payload.action);
//     } catch (error) {
//       console.error("GAS Connection Error:", error);
//       throw error;
//     }
//   }
// };







// const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxkN8VBK8emW5naCDkQooxRLncEoFRhQElFMbmp5MpzIsKntXDEvyzZ7KkcovPn6V5-jg/exec';
// const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyq-v1H0OsW4Kp8huZneNSUXja4BdzpOqzbFtvY55_JeZtS3P289Mz-zTdWBA3HqPloJA/exec';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxtoxHlg9mYbo0dMNv2baDYGiIQXyzqOOvIQ_gpdc_zVLL4w9Q9shH6KkpOjFsodlbsTQ/exec';

/**
 * Generates header "18-Feb" precisely for the sheet.
 * Hardcoded timeZone ensures consistent date mapping regardless of browser location.
 */

const getDateHeaderFormat = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    timeZone: 'Asia/Kolkata'
  });
  const parts = formatter.formatToParts(now);
  const day = parts.find(p => p.type === 'day')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  return `${day}-${month}`;
};

const getLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("0,0");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(`${position.coords.latitude.toFixed(6)},${position.coords.longitude.toFixed(6)}`);
      },
      () => resolve("0,0"),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
};

export const appsScriptService = {
  async saveSignIn(employeeId: string, employeeName: string): Promise<void> {
    const locationStr = await getLocation();
    return this.postToScript({
      action: 'signIn',
      employee: employeeName.trim(),
      employeeId: employeeId,
      location: locationStr,
      dateHeader: getDateHeaderFormat()
    });
  },

  async saveSignOut(employeeId: string, employeeName: string): Promise<void> {
    const locationStr = await getLocation();
    return this.postToScript({
      action: 'signOut',
      employee: employeeName.trim(),
      employeeId: employeeId,
      location: locationStr,
      dateHeader: getDateHeaderFormat()
    });
  },

  async adminMarkStatus(employeeName: string, status: string): Promise<void> {
    return this.postToScript({
      action: 'adminMarkLeave',
      employee: employeeName.trim(),
      status: status,
      dateHeader: getDateHeaderFormat()
    });
  },

  async syncSummary(): Promise<void> {
    return this.postToScript({
      action: 'refresh',
      dateHeader: getDateHeaderFormat(),
      employee: 'System'
    });
  },

  async postToScript(payload: any) {
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      console.log("Transmission Successful:", payload.action);
    } catch (error) {
      console.error("Transmission Error:", error);
      throw error;
    }
  }
};


 