<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseCard from '../../components/BaseCard.vue'
import BaseButton from '../../components/BaseButton.vue'
import IconAtom from '../../components/IconAtom.vue'
import PetAvatar from '../../components/PetAvatar.vue'
import SectionHeader from '../../components/SectionHeader.vue'
import TopBar from '../../components/TopBar.vue'
import BottomNav from '../../components/BottomNav.vue'
import FormField from '../../components/FormField.vue'
import ToggleGroup from '../../components/ToggleGroup.vue'
import { getPetProfile, savePetProfile, type PetProfile } from '../../services/petStore'

const pet = reactive<PetProfile>(getPetProfile())

const speciesOptions = ['猫', '狗']
const genderOptions = ['公', '母']
const neuteredOptions = ['已绝育', '未绝育']

function save() {
  savePetProfile({ ...pet })
  uni.showToast({ title: '已保存', icon: 'success' })
}

function onSpeciesChange(e: any) {
  pet.species = e.detail.value === '猫' ? 'cat' : 'dog'
}

function onGenderChange(e: any) {
  pet.gender = e.detail.value
}

function onNeuteredChange(e: any) {
  pet.neutered = e.detail.value === '已绝育'
}

const menuItems = [
  { icon: 'emergency', label: '紧急求助', desc: '红色急症快速入口', color: '#E87060', url: '/pages/sub/emergency' },
  { icon: 'settings', label: '提醒设置', desc: '疫苗、驱虫、复诊提醒', color: '#7B8B7E', url: '/pages/sub/reminder' },
  { icon: 'heart', label: '就医摘要', desc: '整理给兽医看的信息', color: '#E8956E', url: '/pages/sub/summary' },
  { icon: 'edit', label: '症状分诊', desc: '结构化症状判断流程', color: '#7EBDA6', url: '/pages/sub/symptom' },
]

function goEmergency() {
  uni.navigateTo({ url: '/pages/sub/emergency' })
}
</script>

<template>
  <view class="page">
    <TopBar title="我的宠物" showEmergency @emergency="goEmergency" />
    <view class="page-body">
    <!-- Profile Card -->
    <BaseCard padding="32rpx" class="profile-card">
      <view class="profile-header">
        <PetAvatar :name="pet.name" :species="pet.species" :size="100" />
        <view class="profile-meta">
          <view class="profile-name-row">
            <text class="profile-name">{{ pet.name }}</text>
            <BaseButton variant="ghost" size="sm" @tap="save()">保存</BaseButton>
          </view>
          <text class="profile-breed">{{ pet.species === 'cat' ? '🐱' : '🐶' }} {{ pet.breed }} · {{ pet.age }} · {{ pet.gender }}</text>
        </view>
      </view>

      <!-- Stats -->
      <view class="profile-stats">
        <view class="stat-item">
          <text class="stat-val">{{ pet.weightKg }}</text>
          <text class="stat-unit">kg</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-val">{{ pet.neutered ? '已' : '未' }}</text>
          <text class="stat-unit">绝育</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-val">{{ pet.allergies || '无' }}</text>
          <text class="stat-unit">过敏</text>
        </view>
      </view>
    </BaseCard>

    <!-- Edit Form -->
    <SectionHeader title="编辑档案" kicker="Profile" />

    <BaseCard padding="24rpx" class="form-card">
      <!-- Species Picker -->
      <view class="form-field">
        <text class="form-label">宠物类型</text>
        <picker :range="speciesOptions" @change="onSpeciesChange">
          <view class="form-input-picker">
            <text>{{ pet.species === 'cat' ? '猫' : '狗' }}</text>
            <IconAtom name="arrow_down" :size="24" color="#A8B5A8" />
          </view>
        </picker>
      </view>

      <view class="form-field">
        <text class="form-label">名字</text>
        <input v-model="pet.name" class="form-input" placeholder="宠物名字" @blur="save" />
      </view>
      <view class="form-field">
        <text class="form-label">品种</text>
        <input v-model="pet.breed" class="form-input" placeholder="如：橘猫、金毛" @blur="save" />
      </view>
      <view class="form-row">
        <view class="form-field flex-1">
          <text class="form-label">年龄</text>
          <input v-model="pet.age" class="form-input" placeholder="如：2岁" @blur="save" />
        </view>
        <view class="form-field flex-1">
          <text class="form-label">体重 (kg)</text>
          <input v-model="pet.weightKg" class="form-input" type="digit" placeholder="4.8" @blur="save" />
        </view>
      </view>

      <!-- Gender Picker -->
      <view class="form-field">
        <text class="form-label">性别</text>
        <picker :range="genderOptions" @change="onGenderChange">
          <view class="form-input-picker">
            <text>{{ pet.gender }}</text>
            <IconAtom name="arrow_down" :size="24" color="#A8B5A8" />
          </view>
        </picker>
      </view>

      <!-- Neutered Picker -->
      <view class="form-field">
        <text class="form-label">绝育</text>
        <picker :range="neuteredOptions" @change="onNeuteredChange">
          <view class="form-input-picker">
            <text>{{ pet.neutered ? '已绝育' : '未绝育' }}</text>
            <IconAtom name="arrow_down" :size="24" color="#A8B5A8" />
          </view>
        </picker>
      </view>

      <view class="form-field">
        <text class="form-label">饮食备注</text>
        <input v-model="pet.dietNote" class="form-input" placeholder="干粮/湿粮/自制" @blur="save" />
      </view>

      <BaseButton variant="primary" block size="md" @tap="save">保存档案</BaseButton>
    </BaseCard>

    <!-- Menu items -->
    <view class="menu-list">
      <BaseCard
        v-for="item in menuItems"
        :key="item.label"
        pressable
        padding="16rpx"
        class="menu-item"
        @tap="uni.navigateTo({ url: item.url })"
      >
        <view class="menu-item-left">
          <IconAtom :name="item.icon" :size="36" :color="item.color" />
        </view>
        <view class="menu-item-body">
          <text class="menu-item-title">{{ item.label }}</text>
          <text class="menu-item-desc">{{ item.desc }}</text>
        </view>
        <IconAtom name="forward" :size="28" color="#A8B5A8" />
      </BaseCard>
    </view>
    </view>
    <BottomNav current="profile" />
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #FAF7F2;
}

.page-body {
  padding: 32rpx 24rpx 24rpx;
  padding-bottom: calc(140rpx + 24rpx);
}

.profile-card {
  margin-bottom: 32rpx;
}

.profile-header {
  display: flex;
  gap: 24rpx;
  align-items: center;
  margin-bottom: 24rpx;
}

.profile-meta {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile-name {
  font-size: 48rpx;
  font-weight: 900;
  color: #2D3436;
  max-width: 300rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.profile-breed {
  font-size: 24rpx;
  color: #7B8B7E;
  margin-top: 4rpx;
  display: block;
  max-width: 440rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.profile-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx;
  background: #F5F0EA;
  border-radius: 12rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.stat-val {
  font-size: 34rpx;
  font-weight: 700;
  color: #2D3436;
}

.stat-unit {
  font-size: 22rpx;
  color: #A8B5A8;
}

.stat-divider {
  width: 2rpx;
  height: 40rpx;
  background: #F0EBE4;
}

.form-card {
  margin-bottom: 32rpx;
}

.form-field {
  margin-bottom: 16rpx;
}

.form-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #A8B5A8;
  text-transform: uppercase;
  display: block;
  margin-bottom: 6rpx;
}

.form-input {
  width: 100%;
  height: 72rpx;
  padding: 0 16rpx;
  background: #F5F0EA;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #2D3436;
  border: 2rpx solid #F0EBE4;
  box-sizing: border-box;
}

.form-input-picker {
  width: 100%;
  height: 72rpx;
  padding: 0 16rpx;
  background: #F5F0EA;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #2D3436;
  border: 2rpx solid #F0EBE4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.form-row {
  display: flex;
  gap: 16rpx;
}

.flex-1 {
  flex: 1;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.menu-item-left {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-item-body {
  flex: 1;
}

.menu-item-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #2D3436;
  display: block;
}

.menu-item-desc {
  font-size: 22rpx;
  color: #A8B5A8;
}
</style>
