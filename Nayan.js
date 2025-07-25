// sadhin.js

module.exports = async ({ api, event }) => {
  const logger = require('./Nayan/catalogs/Nayanc.js'); // তোমার logger ফাইল পাথ ঠিক আছে নিশ্চিত করো

  const configCustom = {
    autosetbio: {
      status: false,
      bio: `prefix : ${global.config?.PREFIX || '!'}`,
      note: 'Automatically change the bot bio.'
    },
    notification: {
      status: false,
      time: 39, // minutes
      note: 'Bot will update operator with user/group/admin info every X minutes.'
    },
    greetings: {
      status: false,
      morning: 'Good morning everyone, have a nice day.',
      afternoon: "Good afternoon everyone, don't forget to eat your lunch.",
      evening: "Good evening everyone, don't forget to eat.",
      sleep: "Good night everyone, time to sleep.",
      note: 'Greetings sent based on Asia/Dhaka timezone.'
    },
    reminder: {
      status: false,
      time: 40, // minutes
      msg: 'Reminder test message',
      note: 'Sends reminder message every X minutes.'
    },
    autoDeleteCache: {
      status: true,
      time: 10, // minutes
      note: 'Automatically deletes cache files periodically.'
    },
    autoRestart: {
      status: false, // চালাতে চাইলে true করবে
      time: 40, // minutes
      note: 'Automatically restarts the bot periodically.'
    },
    acceptPending: {
      status: false,
      time: 10, // minutes
      note: 'Automatically approves pending message requests.'
    }
  };

  // বায়ো আপডেট ফাংশন
  function autosetbio(config) {
    if (config.status) {
      try {
        api.changeBio(config.bio, (err) => {
          if (err) {
            logger(`Error changing bio: ${err}`, 'autosetbio');
          } else {
            logger(`Bot bio changed to: ${config.bio}`, 'autosetbio');
          }
        });
      } catch (error) {
        logger(`Exception in autosetbio: ${error}`, 'autosetbio');
      }
    }
  }

  // অপারেটরকে সময় সময় ইনফো পাঠানো
  function notification(config) {
    if (config.status) {
      setInterval(() => {
        try {
          const operator = global.config?.OPERATOR?.[0];
          if (!operator) return logger('No operator configured', 'notification');
          api.sendMessage(
            `Bot Information:\nUsers: ${global.data?.allUserID?.length || 0}\nGroups: ${global.data?.allThreadID?.length || 0}\nOperators: ${global.config.OPERATOR.length}\nAdmins: ${global.config.ADMINBOT.length}`,
            operator
          );
        } catch (error) {
          logger(`Error in notification: ${error}`, 'notification');
        }
      }, config.time * 60 * 1000);
    }
  }

  // স্বাগত বার্তা পাঠানো (Asia/Dhaka টাইমজোন)
  function greetings(config) {
    if (config.status) {
      const timezoneOffset = 6 * 60; // Asia/Dhaka UTC+6 in minutes
      setInterval(() => {
        try {
          const now = new Date();
          const localTime = new Date(now.getTime() + timezoneOffset * 60 * 1000);
          const hours = localTime.getHours();
          const minutes = localTime.getMinutes();

          let greetingMessage = null;

          if (hours === 6 && minutes === 0) greetingMessage = config.morning;
          else if (hours === 12 && minutes === 0) greetingMessage = config.afternoon;
          else if (hours === 18 && minutes === 0) greetingMessage = config.evening;
          else if (hours === 22 && minutes === 0) greetingMessage = config.sleep;

          if (greetingMessage) {
            global.data.allThreadID.forEach(threadID => {
              api.sendMessage(greetingMessage, threadID);
            });
            logger(`Sent greeting: "${greetingMessage}"`, 'greetings');
          }
        } catch (error) {
          logger(`Error in greetings: ${error}`, 'greetings');
        }
      }, 60 * 1000); // প্রতি মিনিটে চেক করবে
    }
  }

  // রিমাইন্ডার মেসেজ পাঠানো
  function reminder(config) {
    if (config.status) {
      setInterval(() => {
        try {
          const allThreads = global.data.allThreadID || [];
          allThreads.forEach(threadID => {
            api.sendMessage(config.msg, threadID);
          });
          logger(`Sent reminder message to all threads`, 'reminder');
        } catch (error) {
          logger(`Error in reminder: ${error}`, 'reminder');
        }
      }, config.time * 60 * 1000);
    }
  }

  // ক্যাশ ফাইল ডিলিট করা (লিনাক্স/ম্যাক OS জন্য)
  function autoDeleteCache(config) {
    if (config.status) {
      const { exec } = require('child_process');
      setInterval(() => {
        exec(
          'rm -rf ../../scripts/commands/cache && mkdir -p ../../scripts/commands/cache && rm -rf ../../scripts/events/cache && mkdir -p ../../scripts/events/cache',
          (error, stdout, stderr) => {
            if (error) {
              logger(`Error deleting cache: ${error}`, 'cache');
              return;
            }
            if (stderr) {
              logger(`Stderr while deleting cache: ${stderr}`, 'cache');
              return;
            }
            logger('Successfully deleted caches', 'cache');
          }
        );
      }, config.time * 60 * 1000);
    }
  }

  // অটো রিস্টার্ট (কমেন্ট আকারে রেখেছি, চালাতে চাইলে আনকমেন্ট করবে)
  
  function autoRestart(config) {
    if (config.status) {
      setInterval(() => {
        logger('Auto restart initiated...', 'autoRestart');
        process.exit(1);
      }, config.time * 60 * 1000);
    }
  }
  */

  // Pending মেসেজ অটো এক্সেপ্ট
  function acceptPending(config) {
    if (config.status) {
      setInterval(async () => {
        try {
          const list = [
            ...(await api.getThreadList(1, null, ['PENDING'])),
            ...(await api.getThreadList(1, null, ['OTHER']))
          ];
          if (list.length) {
            api.sendMessage('This thread is automatically approved by the system.', list[0].threadID);
          }
        } catch (error) {
          logger(`Error in acceptPending: ${error}`, 'acceptPending');
        }
      }, config.time * 60 * 1000);
    }
  }

  // কল করো সব ফাংশন
  autosetbio(configCustom.autosetbio);
  notification(configCustom.notification);
  greetings(configCustom.greetings);
  reminder(configCustom.reminder);
  autoDeleteCache(configCustom.autoDeleteCache);
  // autoRestart(configCustom.autoRestart); // চালাতে চাইলে আনকমেন্ট করো
  acceptPending(configCustom.acceptPending);
};
