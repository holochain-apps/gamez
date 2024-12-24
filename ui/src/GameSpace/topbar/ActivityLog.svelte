<script lang="ts">
  import BellIcon from '~icons/fa6-solid/bell';
  import BellSlashIcon from '~icons/fa6-regular/bell-slash';
  import cx from 'classnames';
  import { relativeTimeFormat, timeFormat } from '~/lib/util';
  import { tooltip } from '~/shared/tooltip';
  import TopBarDropButton from '../ui/TopBarDropButton.svelte';
  import type { GameSpaceSyn, AgentKey, LogType, Log } from '~/store';
  import AgentAvatar from '~/shared/AgentAvatar.svelte';

  export let gameSpace: GameSpaceSyn;

  let agentKey: AgentKey = gameSpace.pubKey;
  $: state = gameSpace.state;
  $: notificationsConfigOverride = $state.notificationsConfigOverride;
  $: activityLog = $state.activityLog;

  // let log: Log[] = [
  //   {
  //     message: 'Ezequiel joined at slot 4',
  //     time: 1735041958600,
  //     seenBy: [],
  //     type: 'join',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel moved piece',
  //     time: 1735021958600,
  //     seenBy: [],
  //     type: 'move',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel moved piece',
  //     time: 1735020958600,
  //     seenBy: [],
  //     type: 'move',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel ended his turn',
  //     time: 1735011958600,
  //     seenBy: [],
  //     type: 'turn',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel moved piece',
  //     time: 1735020958600,
  //     seenBy: [],
  //     type: 'move',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel ended his turn',
  //     time: 1735011958600,
  //     seenBy: [],
  //     type: 'turn',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel moved piece',
  //     time: 1735020958600,
  //     seenBy: [],
  //     type: 'move',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel ended his turn',
  //     time: 1735011958600,
  //     seenBy: [],
  //     type: 'turn',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel moved piece',
  //     time: 1735020958600,
  //     seenBy: [],
  //     type: 'move',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel ended his turn',
  //     time: 1735011958600,
  //     seenBy: [],
  //     type: 'turn',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel moved piece',
  //     time: 1735020958600,
  //     seenBy: [],
  //     type: 'move',
  //     agentKey: '',
  //   },
  //   {
  //     message: 'Ezequiel ended his turn',
  //     time: 1735011958600,
  //     seenBy: [],
  //     type: 'turn',
  //     agentKey: '',
  //   },
  // ];

  $: notificationsCount = activityLog.filter((l) => !l.seenBy.includes(agentKey)).length;

  const LOG_TYPES_ICONS: Record<LogType, string> = {
    turn: '⏱',
    move: '🫳',
    join: '👤',
    left: '👋',
    add: '➕',
    remove: '🗑',
  };

  function isUnseen(log: Log) {
    return !log.seenBy.includes(agentKey);
  }

  function markAsSeen() {
    gameSpace.change({ type: 'seen-activity-log' });
    // log = log.map((l) => ({ ...l, seenBy: [...l.seenBy, agentKey] }));
  }

  $: notificationIsActivatedForLogType = (logType: LogType) =>
    notificationsConfigOverride[agentKey]?.[logType] ?? notificationsConfigOverride[logType];

  function setNotificationForLogType(logType: LogType, value: boolean) {
    notificationsConfigOverride[agentKey] = {
      ...notificationsConfigOverride[agentKey],
      [logType]: value,
    };
  }
</script>

<TopBarDropButton title="Activity" counter={notificationsCount} onClose={markAsSeen}>
  <BellIcon slot="icon" />
  <div class="w-100">
    {#each { length: activityLog.length } as _, i (i)}
      {@const l = activityLog[activityLog.length - 1 - i]}
      {@const unseen = isUnseen(l)}
      {@const date = new Date(l.time)}
      {@const notificationActivated = notificationIsActivatedForLogType(l.type)}
      <div
        class={cx('first:b-t last:rounded-b-md b-b b-black/10 py2 bg-black/5 flexcs', {
          'bg-main-800!': unseen,
        })}
      >
        <div class="text-lg flex-shrink-0 w12 text-center">{LOG_TYPES_ICONS[l.type]}</div>
        <div class="mr2 flex-shrink-0 w6 h-full flexcc"
          ><AgentAvatar pubKey={l.agentKey} size={20} /></div
        >
        <div class="flex-grow flex flex-col">
          <div>
            {l.message}
          </div>
          <span
            class="position-relative opacity-50 text-xs"
            use:tooltip={{ content: timeFormat(date), placement: 'bottom-start' }}
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
