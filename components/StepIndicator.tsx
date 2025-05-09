interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              index + 1 <= currentStep ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {index + 1}
          </div>

          {index < totalSteps - 1 && (
            <div
              className={`flex-1 h-1 mx-2 ${index + 1 < currentStep ? "bg-emerald-500" : "bg-gray-200"}`}
              style={{ width: "3rem" }}
            ></div>
          )}
        </div>
      ))}
    </div>
  )
}
