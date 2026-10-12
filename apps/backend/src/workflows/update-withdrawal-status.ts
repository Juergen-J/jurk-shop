import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { WITHDRAWAL_MODULE } from "../modules/withdrawal"
import WithdrawalModuleService from "../modules/withdrawal/service"

type Input = { id: string; status: "received" | "processed" }

const updateWithdrawalStatusStep = createStep(
  "update-withdrawal-status",
  async ({ id, status }: Input, { container }) => {
    const service: WithdrawalModuleService = container.resolve(WITHDRAWAL_MODULE)
    const previous = await service.retrieveWithdrawal(id)
    const withdrawal = await service.updateWithdrawals({ id, status })

    return new StepResponse(withdrawal, { id, status: previous.status })
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }

    const service: WithdrawalModuleService = container.resolve(WITHDRAWAL_MODULE)
    await service.updateWithdrawals(previous)
  }
)

export const updateWithdrawalStatusWorkflow = createWorkflow(
  "update-withdrawal-status",
  (input: Input) => new WorkflowResponse(updateWithdrawalStatusStep(input))
)
