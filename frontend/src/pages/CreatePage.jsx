import Navbar from '../components/layout/Navbar'
import PageWrapper from '../components/layout/PageWrapper'
import StepIndicator from '../components/create/StepIndicator'
import Step1Upload from '../components/create/Step1Upload'
import Step2Persona from '../components/create/Step2Persona'
import Step3Generate from '../components/create/Step3Generate'
import { CreationProvider, useCreation } from '../context/CreationContext'

export default function CreatePage() {
  return (
    <CreationProvider>
      <Navbar />
      <PageWrapper>
        <CreatePageInner />
      </PageWrapper>
    </CreationProvider>
  )
}

function CreatePageInner() {
  const { currentStep } = useCreation()
  return (
    <div className="max-w-5xl mx-auto py-10 px-8">
      <StepIndicator currentStep={currentStep} />
      {currentStep === 1 && <Step1Upload />}
      {currentStep === 2 && <Step2Persona />}
      {currentStep === 3 && <Step3Generate />}
    </div>
  )
}
