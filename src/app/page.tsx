import Hero from '@/components/Hero'
import Services from '@/components/Services'
import LogisticsServices from '@/components/LogisticsServices'
import AdditionalFeatures from '@/components/ExporterServices'
import CertifiedService from '@/components/CertifiedService'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <Hero />
        <Services />
        <LogisticsServices />
        <AdditionalFeatures />
        <CertifiedService />
      </div>
      <Footer />
    </div>
  )
}