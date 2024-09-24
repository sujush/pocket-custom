import Hero from '@/components/Hero'
import Services from '@/components/Services'
import LogisticsServices from '@/components/LogisticsServices'
import Footer from '@/components/Footer'


export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <Hero />
        <Services />
        <LogisticsServices />
      </div>
      <Footer />
    </div>
  )
}