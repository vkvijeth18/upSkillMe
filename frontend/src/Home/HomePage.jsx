import React from 'react'

import HeroSection from './HeroSection.jsx'
import WhySkillMeUp from './whySkillMeUp.jsx'
import HowToGetStarted from './getStarted.jsx'
import GetInTouch from './getInTouch.jsx'
export default function HomePage() {
    return (
        <div className="flex-row pt-10 bg-[#080B1A] mt-0 overflow-y-hidden">
            <HeroSection />
            <WhySkillMeUp />
            <HowToGetStarted />
            <GetInTouch />
        </div>
    )
}
