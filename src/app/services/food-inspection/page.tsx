'use client'

import React from 'react'
import CertifiedFoodInspection from '@/components/CertifiedFoodInspection'

export default function FoodInspectionPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">수입식품 검사</h1>
      <CertifiedFoodInspection />
    </div>
  )
}
