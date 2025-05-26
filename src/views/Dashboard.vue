```vue
<template>
  <div class="dashboard-container d-flex flex-column">
    <!-- Main Content -->
    <div class="main-content flex-grow-1 p-4">
      <!-- Row 1 -->
      <div class="row g-4 mx-0">
        <!-- Profile Widget -->
        <div class="col-6">
          <div class="card shadow widget-height">
            <div class="card-body">
              <h2 class="card-title fs-5 fw-semibold mb-4 text-center">Your Profile</h2>
              <div v-if="profileError" class="alert alert-danger">
                {{ profileError }}
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <p class="fs-6 line-height-fix"><strong>Name:</strong> {{ profileData.fullName || 'N/A' }}</p>
                <p class="fs-6 line-height-fix"><strong>Email:</strong> {{ profileData.email || 'N/A' }}</p>
                <p class="fs-6 line-height-fix"><strong>Level:</strong> {{ profileData.profile?.learningLevel || 'N/A' }}</p>
                <p class="fs-6 line-height-fix"><strong>Learning Streak:</strong> {{ profileData.profile?.learningStreak || '0' }} days</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Recent Activities Widget -->
        <div class="col-6">
          <div class="card shadow widget-height">
            <div class="card-body">
              <h2 class="card-title fs-5 fw-semibold mb-4 text-center">Recent Activities</h2>
              <div v-if="activitiesError" class="alert alert-danger">
                {{ activitiesError }}
              </div>
              <ul v-else class="list-unstyled d-flex flex-column gap-3">
                <li v-for="activity in recentActivities" :key="activity.id" class="d-flex justify-content-between align-items-center">
                  <span class="activity-text fs-6 line-height-fix">{{ activity.name }}</span>
                  <span :class="getStatusClass(activity.status)" class="fs-6 line-height-fix">{{ activity.status }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 2 -->
      <div class="row g-4 mx-0 mt-4">
        <!-- Flashcard Widget -->
        <div class="col-6">
          <div class="card shadow widget-height">
            <div class="card-body">
              <h2 class="card-title fs-5 fw-semibold mb-4 text-center">Flashcards</h2>
              <div v-if="flashcardsError" class="alert alert-danger">
                {{ flashcardsError }}
              </div>
              <ul v-else class="list-unstyled d-flex flex-column gap-3">
                <li v-for="flashcard in flashcards" :key="flashcard.id" class="d-flex justify-content-between align-items-center">
                  <span class="fs-6 line-height-fix">Word: {{ flashcard.word }}</span>
                  <button class="btn btn-link text-primary p-0 fs-6 line-height-fix">Learn</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- Recent Test Results Widget -->
        <div class="col-6">
          <div class="card shadow widget-height">
            <div class="card-body">
              <h2 class="card-title fs-5 fw-semibold mb-4 text-center">Recent Test Results</h2>
              <div v-if="testsError" class="alert alert-danger">
                {{ testsError }}
              </div>
              <ul v-else class="list-unstyled d-flex flex-column gap-3">
                <li v-for="test in recentTests" :key="test.id" class="d-flex justify-content-between">
                  <span class="fs-6 line-height-fix mock-test-link" @click="goToMockTest(test.id)">{{ test.name }}</span>
                  <span class="text-primary fs-6 line-height-fix">Score: {{ test.score }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from '../api/axios';
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    // Dynamic data from backend
    const profileData = ref({});
    const recentActivities = ref([]);
    const flashcards = ref([]);
    const recentTests = ref([]);

    // Error messages
    const profileError = ref('');
    const activitiesError = ref('');
    const flashcardsError = ref('');
    const testsError = ref('');

    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        const response = await axios.get('/api/profile', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        profileData.value = response.data;
      } catch (err) {
        profileError.value = err.response?.data?.message || 'Failed to load profile data';
      }
    };

    // Fetch Speaking activities
    const fetchSpeakingActivities = async () => {
      try {
        const response = await axios.get('/api/speaking/attempts', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        return response.data.slice(0, 2).map((item) => ({
          id: item.id,
          name: `Speaking: ${item.topicTitle || 'Unknown Topic'}`,
          status: item.feedback ? 'Completed' : 'In Progress',
          type: 'speaking',
          itemId: item.topicId,
          submittedAt: item.submittedAt,
        }));
      } catch (err) {
        console.error('Failed to fetch speaking activities:', err);
        return [];
      }
    };

    // Fetch Listening activities
    const fetchListeningActivities = async () => {
      try {
        const response = await axios.get('/api/listening/progress', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        return response.data.slice(0, 2).map((item) => ({
          id: item.id,
          name: `Listening: ${item.exerciseTitle || 'Unknown Exercise'}`,
          status: item.score > 0 ? 'Completed' : 'In Progress',
          type: 'listening',
          itemId: item.exerciseId,
          submittedAt: item.updatedAt,
        }));
      } catch (err) {
        console.error('Failed to fetch listening activities:', err);
        return [];
      }
    };

    // Fetch Writing activities
    const fetchWritingActivities = async () => {
      try {
        const response = await axios.get('/api/writing/submissions', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        return response.data.slice(0, 2).map((item) => ({
          id: item.id,
          name: `Writing: ${item.promptTitle || 'Unknown Prompt'}`,
          status: item.feedback ? 'Completed' : 'In Progress',
          type: 'writing',
          itemId: item.promptId,
          submittedAt: item.submittedAt,
        }));
      } catch (err) {
        console.error('Failed to fetch writing activities:', err);
        return [];
      }
    };

    // Fetch Reading activities
    const fetchReadingActivities = async () => {
      try {
        const response = await axios.get('/api/reading/progress', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        return response.data.slice(0, 2).map((item) => ({
          id: item.id,
          name: `Reading: ${item.passageTitle || 'Unknown Passage'}`,
          status: item.score > 0 ? 'Completed' : 'In Progress',
          type: 'reading',
          itemId: item.passageId,
          submittedAt: item.updatedAt,
        }));
      } catch (err) {
        console.error('Failed to fetch reading activities:', err);
        return [];
      }
    };

    // Combine and sort activities
    const fetchRecentActivities = async () => {
      try {
        const [speaking, listening, writing, reading] = await Promise.all([
          fetchSpeakingActivities(),
          fetchListeningActivities(),
          fetchWritingActivities(),
          fetchReadingActivities(),
        ]);
        const activities = [...speaking, ...listening, ...writing, ...reading];
        recentActivities.value = activities
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 4);
      } catch (err) {
        activitiesError.value = err.response?.data?.message || 'Failed to load recent activities';
      }
    };

    // Fetch flashcards
    const fetchFlashcards = async () => {
      try {
        const response = await axios.get('/api/flashcards', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        flashcards.value = response.data.slice(0, 4);
      } catch (err) {
        flashcardsError.value = err.response?.data?.message || 'Failed to load flashcards';
      }
    };

    // Fetch recent test results
    const fetchRecentTests = async () => {
      try {
        const response = await axios.get('/api/tests/recent', {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        recentTests.value = response.data.slice(0, 4);
      } catch (err) {
        testsError.value = err.response?.data?.message || 'Failed to load recent tests';
      }
    };

    // Load data when component is mounted
    onMounted(() => {
      fetchProfileData();
      fetchRecentActivities();
      fetchFlashcards();
      fetchRecentTests();
    });

    // Format status class
    const getStatusClass = (status) => {
      switch (status) {
        case 'Completed':
          return 'text-success';
        case 'In Progress':
          return 'text-primary';
        default:
          return '';
      }
    };

    // Handle Start button
    const startActivity = (activity) => {
      switch (activity.type) {
        case 'speaking':
          router.push(`/speaking/${activity.itemId}`);
          break;
        case 'listening':
          router.push(`/listening/${activity.itemId}`);
          break;
        case 'writing':
          router.push(`/writing/${activity.itemId}`);
          break;
        case 'reading':
          router.push(`/reading/${activity.itemId}`);
          break;
        default:
          console.warn('Unknown activity type:', activity.type);
      }
    };

    // Navigate to mock test
    const goToMockTest = (testId) => {
      router.push(`/results/${testId}`);
    };

    return {
      profileData,
      recentActivities,
      flashcards,
      recentTests,
      profileError,
      activitiesError,
      flashcardsError,
      testsError,
      getStatusClass,
      startActivity,
      goToMockTest,
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  height: calc(100vh - 80px);
  background-color: #f0f0f0;
  padding-top: 120px;
}

.main-content {
  overflow-y: auto;
}

.row {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.btn-link {
  text-decoration: none;
}

.btn-link:hover {
  text-decoration: underline;
}

.widget-height {
  height: 250px;
}

.line-height-fix {
  line-height: 1.5;
  margin: 0;
}

.mock-test-link {
  cursor: pointer;
  color: #000;
  text-decoration: none;
}

.mock-test-link:hover {
  text-decoration: underline;
}
</style>
```