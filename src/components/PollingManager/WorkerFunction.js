export const workerScript = `
self.onmessage = async function (e) {
try{ 
const {interval,duration,userId,id} = e?.data;
    let elapsed = 0;
    const poll = async () => {
      try {
        elapsed += interval
        const response = {status: "success", isTerminate: elapsed >= duration,currentId:id}
        if (response.isTerminate) {
          elapsed = 0;
        }
        self.postMessage({status: 'success', response});
        if (!response.isTerminate) {
          setTimeout(poll, interval);
        }
      } catch (error) {
        console.log("Error in worker function--->", error);
        self.postMessage({status: 'error', error: error?.message});
        if (elapsed < duration) {
          elapsed += interval;
          setTimeout(poll, interval);
        }
      }
    };
    poll();
    }catch(error){}
  }`;
