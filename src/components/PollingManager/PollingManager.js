import React, {useEffect, useRef, useState} from "react";
import {dispatch, useSelector} from "../../store";
import {triggerNotification} from "../../store/reducers/chat";
import {workerScript} from "./WorkerFunction";
import {v1 as uuidv1} from "uuid";
import createWorker from "./CreateWorker"


const PollingManager = () => {
   const menuState = useSelector((state) => state.folder);
  const workerRef = useRef(null);
  const intervalRef = useRef(null);
  const currentPollId = useRef(null)
  const tokenRef = useRef(null);

  const startPolling = async (isIntervalRunning, currentWorkerDuration, workerId) => {
    if (workerId) {
      currentPollId.current = workerId
    }
    const myWorker = createWorker(workerScript);
    myWorker.onmessage = function (e) {
      if (e.data.status === 'success') {
        if (((e.data.response.currentId === currentPollId.current) || isIntervalRunning ) && navigator.onLine) {
          dispatch(triggerNotification({isNotify: true, isPolling: true}))
        }
        if (e.data.response.isTerminate) {
          myWorker.terminate();
        }
      } else if (e.data.status === 'error') {
        console.log("error in pollingManager--->",e.data)
        myWorker.terminate();
      }
    };

    myWorker.postMessage({
      interval: 10000,
      duration: isIntervalRunning ? 10000 : currentWorkerDuration,
      userId: localStorage.getItem("userId") || "",
      id: currentPollId.current
    });
    workerRef.current = myWorker;
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      startPolling(true);
    }, 10 * 60 * 1000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(tokenRef.current);
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [])

  useEffect(() => {
    if (menuState?.triggerWorker?.isWorkerInvoked) {
      const uploadType = menuState?.triggerWorker?.type;
      const duration = 1 * 60000;
      const objectId = uuidv1()
      let currentWorkerId = objectId.replace(/-/g, '').substring(0, 24);
      startPolling(false, duration, currentWorkerId)
    }

  }, [menuState?.triggerWorker])
  return null;
}

export default PollingManager;
