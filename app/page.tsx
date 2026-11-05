import AboutUs from "@/components/AboutUS"
import { HeroSlider } from "@/components/home/HeroSlider"
import HowBookingWorks from "@/components/HowBookingswork"
import StudioCategory from "@/components/StudioCategory"
import Studioes from "@/components/Studioes"

export default function Page() {
  return (
    <>
      <HeroSlider />
      <Studioes></Studioes>
      <StudioCategory></StudioCategory>
      <HowBookingWorks></HowBookingWorks>
      <AboutUs></AboutUs>
    </>
  )
}
