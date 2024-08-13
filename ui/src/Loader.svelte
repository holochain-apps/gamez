<div class="text-center pt-40">
  <div class="spinner b-main-900 b-t-main-600"></div>
</div>

<style>
  .spinner {
    border-width: 8px;
    border-style: solid;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
