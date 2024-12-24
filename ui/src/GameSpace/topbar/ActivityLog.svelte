<script lang="ts">
  import BellIcon from '~icons/fa6-solid/bell';
  import BellSlashIcon from '~icons/fa6-regular/bell-slash';
  import cx from 'classnames';
  import { relativeTimeFormat, timeFormat } from '~/lib/util';
  import { tooltip } from '~/shared/tooltip';
  import TopBarDropButton from '../ui/TopBarDropButton.svelte';

  export let agentKey: string;

  type AgentKey = string;
  type LogType = 'turn' | 'move' | 'join' | 'left';
  type Log = {
    message: string;
    time: number;
    seenBy: string[];
    type: LogType;
    agentKey: AgentKey;
  };
  const DEFAULT_NOTIFICATIONS_CONFIG: Record<LogType, boolean> = {
    turn: true,
    move: false,
    join: true,
    left: true,
  };
  const NOTIFICATIONS_CONFIG_OVERRIDE: Record<AgentKey, Record<LogType, boolean>> = {};
  let log: Log[] = [
    {
      message: 'Ezequiel joined at slot 4',
      time: 1735041958600,
      seenBy: [],
      type: 'join',
      agentKey: '',
    },
    {
      message: 'Ezequiel moved piece',
      time: 1735021958600,
      seenBy: [],
      type: 'move',
      agentKey: '',
    },
    {
      message: 'Ezequiel moved piece',
      time: 1735020958600,
      seenBy: [],
      type: 'move',
      agentKey: '',
    },
    {
      message: 'Ezequiel ended his turn',
      time: 1735011958600,
      seenBy: [],
      type: 'turn',
      agentKey: '',
    },
    {
      message: 'Ezequiel moved piece',
      time: 1735020958600,
      seenBy: [],
      type: 'move',
      agentKey: '',
    },
    {
      message: 'Ezequiel ended his turn',
      time: 1735011958600,
      seenBy: [],
      type: 'turn',
      agentKey: '',
    },
    {
      message: 'Ezequiel moved piece',
      time: 1735020958600,
      seenBy: [],
      type: 'move',
      agentKey: '',
    },
    {
      message: 'Ezequiel ended his turn',
      time: 1735011958600,
      seenBy: [],
      type: 'turn',
      agentKey: '',
    },
    {
      message: 'Ezequiel moved piece',
      time: 1735020958600,
      seenBy: [],
      type: 'move',
      agentKey: '',
    },
    {
      message: 'Ezequiel ended his turn',
      time: 1735011958600,
      seenBy: [],
      type: 'turn',
      agentKey: '',
    },
    {
      message: 'Ezequiel moved piece',
      time: 1735020958600,
      seenBy: [],
      type: 'move',
      agentKey: '',
    },
    {
      message: 'Ezequiel ended his turn',
      time: 1735011958600,
      seenBy: [],
      type: 'turn',
      agentKey: '',
    },
  ];

  $: notificationsCount = log.filter((l) => !l.seenBy.includes(agentKey)).length;

  const LOG_TYPES_ICONS: Record<LogType, string> = {
    turn: '⏱',
    move: '🫳',
    join: '👤',
    left: '👋',
  };

  function isUnseen(log: Log) {
    return !log.seenBy.includes(agentKey);
  }

  function markAsSeen() {
    log = log.map((l) => ({ ...l, seenBy: [...l.seenBy, agentKey] }));
  }

  $: notificationIsActivatedForLogType = (logType: LogType) =>
    NOTIFICATIONS_CONFIG_OVERRIDE[agentKey]?.[logType] ?? DEFAULT_NOTIFICATIONS_CONFIG[logType];

  function setNotificationForLogType(logType: LogType, value: boolean) {
    NOTIFICATIONS_CONFIG_OVERRIDE[agentKey] = {
      ...NOTIFICATIONS_CONFIG_OVERRIDE[agentKey],
      [logType]: value,
    };
  }
</script>

<TopBarDropButton title="Activity" counter={notificationsCount} onClose={markAsSeen}>
  <BellIcon slot="icon" />
  <div class="w-100">
    {#each log as l}
      {@const unseen = isUnseen(l)}
      {@const date = new Date(l.time)}
      {@const notificationActivated = notificationIsActivatedForLogType(l.type)}
      <div
        class={cx('first:b-t last:rounded-b-md b-b b-black/10 py2 bg-black/5 flexcs', {
          'bg-main-800!': unseen,
        })}
      >
        <span class="text-lg mr1 flex-shrink-0 w12 inline-block text-center"
          >{LOG_TYPES_ICONS[l.type]}</span
        >
        <div class="flex-grow">
          {l.message}
          <span class="position-relative opacity-50 text-xs" use:tooltip={timeFormat(date)}
            >{relativeTimeFormat(date)}</span
          >
        </div>
        <div class="w8 flex-shrink-0 flexcc">
          {#if unseen}
            <div
              class="bg-main-500 h3 w3 flexcc rounded-full"
              use:tooltip={{ content: 'New', placement: 'left' }}
            ></div>
          {/if}
        </div>
        <button
          class="w8 flex-shrink-0 flexcc"
          use:tooltip={{
            content: notificationActivated
              ? 'Disable notifications for this activity type'
              : 'Enable notifications for this activity type',
            placement: 'left',
          }}
          on:click={() => setNotificationForLogType(l.type, !notificationActivated)}
        >
          {#if notificationActivated}
            <span class="text-main-500"><BellIcon /></span>
          {:else}
            <span class="text-main-500 opacity-50"><BellSlashIcon /></span>
          {/if}
        </button>
      </div>
    {/each}
  </div>
</TopBarDropButton>
