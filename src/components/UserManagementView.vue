<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<template>
  <div class="user-management-page">
    <h1>User Management</h1>
    <p class="subtitle">Manage system users and their permissions</p>

    <div class="actions-bar">
      <button @click="showCreateUserModal = true" class="create-button">
        <span>Add New User</span>
      </button>
    </div>

    <div v-if="isLoading && users.length === 0" class="loading">
      <p>Loading users...</p>
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="users.length === 0" class="empty-state">
      <p>No users found in the system.</p>
      <button @click="showCreateUserModal = true" class="create-button">Add First User</button>
    </div>

    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Created</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" :class="{ 'inactive-user': !user.is_active }">
            <td>{{ user.username }}</td>
            <td>{{ user.full_name || 'Not set' }}</td>
            <td>{{ user.email || 'Not set' }}</td>
            <td>
              <span
                class="status-badge"
                :class="{ active: user.is_active, inactive: !user.is_active }"
              >
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td>{{ user.last_login ? formatDate(user.last_login) : 'Never' }}</td>
            <td>
              <div class="user-actions">
                <button @click="() => editUser(user)" class="action-button edit-button">
                  Edit
                </button>
                <button
                  v-if="user.username !== 'admin'"
                  @click="() => confirmDeleteUser(user)"
                  class="action-button delete-button"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit User Modal -->
    <div v-if="showCreateUserModal || showEditUserModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ showEditUserModal ? 'Edit User' : 'Create New User' }}</h3>
          <button @click="closeModals" class="close-button">&times;</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="showEditUserModal ? updateUser() : createUser()">
            <div class="form-group">
              <label for="username">Username</label>
              <input
                id="username"
                v-model="userForm.username"
                type="text"
                required
                :disabled="showEditUserModal"
              />
            </div>

            <div class="form-group" v-if="!showEditUserModal">
              <label for="password">Password</label>
              <input id="password" v-model="userForm.password" type="password" required />
            </div>

            <div class="form-group">
              <label for="email">Email (optional)</label>
              <input id="email" v-model="userForm.email" type="email" />
            </div>

            <div class="form-group">
              <label for="fullName">Full Name (optional)</label>
              <input id="fullName" v-model="userForm.fullName" type="text" />
            </div>

            <div v-if="formError" class="form-error">
              {{ formError }}
            </div>

            <div class="form-actions">
              <button
                type="button"
                @click="closeModals"
                class="cancel-button"
                :disabled="isSubmitting"
              >
                Cancel
              </button>
              <button type="submit" class="submit-button" :disabled="isSubmitting">
                {{ isSubmitting ? 'Saving...' : showEditUserModal ? 'Update User' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="close-button">&times;</button>
        </div>

        <div class="modal-body">
          <p>
            Are you sure you want to delete the user <strong>{{ userToDelete?.username }}</strong
            >? This action cannot be undone.
          </p>

          <div class="form-actions">
            <button type="button" @click="showDeleteModal = false" class="cancel-button">
              Cancel
            </button>
            <button
              type="button"
              @click="deleteUser"
              class="delete-confirm-button"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Deleting...' : 'Delete User' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- filepath: /Users/anuragsharma/Documents/makemeshort-cms/makemeshort-cms/src/components/UserManagementView.vue -->
<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { User, CreateUserRequest } from '@/types/api'

export default defineComponent({
  name: 'UserManagementView',

  setup() {
    const userStore = useUserStore()

    const users = computed(() => userStore.users)
    const isLoading = computed(() => userStore.isLoading)
    const error = computed(() => userStore.error)

    const showCreateUserModal = ref(false)
    const showEditUserModal = ref(false)
    const showDeleteModal = ref(false)
    const isSubmitting = ref(false)
    const formError = ref('')
    const userToEdit = ref<User | null>(null)
    const userToDelete = ref<User | null>(null)

    const userForm = ref({
      username: '',
      password: '',
      email: '',
      fullName: '',
    })

    onMounted(async () => {
      try {
        await userStore.fetchUsers()
      } catch (err) {
        console.error('Failed to fetch users on mount:', err)
      }
    })

    const formatDate = (timestamp: number): string => {
      return new Date(timestamp).toLocaleString()
    }

    const closeModals = () => {
      showCreateUserModal.value = false
      showEditUserModal.value = false
      resetForm()
    }

    const resetForm = () => {
      userForm.value = {
        username: '',
        password: '',
        email: '',
        fullName: '',
      }
      formError.value = ''
      userToEdit.value = null
    }

    const editUser = (user: User) => {
      userToEdit.value = user
      userForm.value = {
        username: user.username,
        password: '', // We don't populate password for edit
        email: user.email || '',
        fullName: user.full_name || '',
      }
      showEditUserModal.value = true
    }

    const createUser = async () => {
      if (!userForm.value.username || !userForm.value.password) {
        formError.value = 'Username and password are required'
        return
      }

      isSubmitting.value = true
      formError.value = ''

      try {
        await userStore.createUser({
          username: userForm.value.username,
          password: userForm.value.password,
          email: userForm.value.email || undefined,
          full_name: userForm.value.fullName || undefined,
        })
        closeModals()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        formError.value = err.message || 'Failed to create user'
      } finally {
        isSubmitting.value = false
      }
    }

    const updateUser = async () => {
      if (!userToEdit.value) return

      isSubmitting.value = true
      formError.value = ''

      const userData: Partial<CreateUserRequest> = {}

      if (userForm.value.password) {
        userData.password = userForm.value.password
      }

      if (userForm.value.email) {
        userData.email = userForm.value.email
      }

      if (userForm.value.fullName) {
        userData.full_name = userForm.value.fullName
      }

      try {
        await userStore.updateUser(userToEdit.value.id, userData)
        closeModals()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        formError.value = err.message || 'Failed to update user'
      } finally {
        isSubmitting.value = false
      }
    }

    const confirmDeleteUser = (user: User) => {
      userToDelete.value = user
      showDeleteModal.value = true
    }

    const deleteUser = async () => {
      if (!userToDelete.value) return

      isSubmitting.value = true

      try {
        await userStore.deleteUser(userToDelete.value.id)
        showDeleteModal.value = false
      } catch (err) {
        console.error('Error deleting user:', err)
      } finally {
        isSubmitting.value = false
        userToDelete.value = null
      }
    }

    return {
      users,
      isLoading,
      error,
      showCreateUserModal,
      showEditUserModal,
      showDeleteModal,
      isSubmitting,
      formError,
      userForm,
      userToDelete,
      formatDate,
      closeModals,
      editUser,
      createUser,
      updateUser,
      confirmDeleteUser,
      deleteUser,
    }
  },
})
</script>

<style scoped>
.user-management-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
  color: #333;
  font-size: 2.5rem;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.2rem;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.create-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-button:hover {
  background-color: #3a7fcb;
}

.loading,
.empty-state {
  padding: 30px;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.users-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.inactive-user {
  opacity: 0.7;
  background-color: #f9f9f9;
}

.role-badge {
  background-color: #e4f0fc;
  color: #4a90e2;
  padding: 2px 8px;
  border-radius: 30px;
  font-size: 0.8rem;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 30px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #e7f4ea;
  color: #4caf50;
}

.status-badge.inactive {
  background-color: #feeae9;
  color: #d32f2f;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: white;
}

.edit-button {
  background-color: #4a90e2;
}

.deactivate-button {
  background-color: #ff9800;
}

.activate-button {
  background-color: #4caf50;
}

.delete-button {
  background-color: #d32f2f;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input[type='text'],
.form-group input[type='email'],
.form-group input[type='password'] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.role-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-checkbox input[type='checkbox'] {
  width: auto;
  margin-right: 6px;
}

.form-error {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-button,
.submit-button,
.delete-confirm-button {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.cancel-button {
  background-color: #f1f1f1;
  color: #666;
}

.submit-button {
  background-color: #4a90e2;
  color: white;
}

.delete-confirm-button {
  background-color: #d32f2f;
  color: white;
}

.cancel-button:hover {
  background-color: #e5e5e5;
}

.submit-button:hover {
  background-color: #3a7fcb;
}

.delete-confirm-button:hover {
  background-color: #c62828;
}

.submit-button:disabled,
.delete-confirm-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .users-table th:nth-child(2),
  .users-table td:nth-child(2),
  .users-table th:nth-child(3),
  .users-table td:nth-child(3),
  .users-table th:nth-child(6),
  .users-table td:nth-child(6),
  .users-table th:nth-child(7),
  .users-table td:nth-child(7) {
    display: none;
  }

  .user-actions {
    flex-direction: column;
  }
}
</style>
