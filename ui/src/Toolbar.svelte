<script lang="ts">
  import LogoIcon from "./icons/LogoIcon.svelte";
  import Folk from "./Folk.svelte";
  import AboutDialog from "./AboutDialog.svelte";
  import type { ProfilesStore } from "@holochain-open-dev/profiles";
  import SvgIcon from "./SvgIcon.svelte";
  import type { GamezStore } from './store';
  import { getContext } from "svelte";
  const { getStore } :any = getContext('gzStore');
  const store:GamezStore = getStore();

  let aboutDialog
  $:bugColor = "color: #5536f9"
</script>

  <AboutDialog bind:this={aboutDialog} />
<div class='toolbar'>
  <div class="left-items">
    <div class="logo"><LogoIcon /></div>
    <div style="margin-left:10px" title="About BoardGamez!" on:click={()=>aboutDialog.open()}><SvgIcon icon=info ></SvgIcon></div>
  </div>
  <div class="right-items">
    <Folk></Folk>
    <a href="https://github.com/holochain-apps/gamez/issues" title="Report a problem in our GitHub repo" target="_blank">
      <div class="nav-button"><SvgIcon icon=faBug size=16 /></div>
    </a>
  </div>
</div>

<style>
  .bug-link {
    padding: 8px 8px;
    display: flex;
    border-radius: 50%;
  }
  a:hover.bug-link {
    background-color: #ddd;
  }
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #eeeeee;
    padding-left: 15px;
    padding-right: 10px;
  }
  .logo {
    height: 40px;
    margin-right: 10px;
    display: contents;
    cursor: pointer;
  }
  .logo-text {
    padding-bottom: 5px;
    margin-left: 15px;
  }
  .right-items {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
  }
  .left-items {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
  }
</style>