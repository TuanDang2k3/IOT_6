<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div class="container">
        <router-link class="navbar-brand" to="/">ESP32 Monitoring</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/devices">Thiết bị</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/channels">Kênh dữ liệu</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/sensor-data">Dữ liệu cảm biến</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/commands">Lệnh điều khiển</router-link>
            </li>
          </ul>
          <span class="navbar-text">
            {{ $currentUser }} | {{ $currentDate }}
          </span>
        </div>
      </div>
    </nav>

    <div class="container">
      <router-view />
    </div>

    <footer class="mt-5 py-3 bg-light text-center">
      <div class="container">
        <p class="text-muted mb-0">ESP32 Weather Monitoring &copy; 2025</p>
      </div>
    </footer>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  flex: 1;
}
</style>