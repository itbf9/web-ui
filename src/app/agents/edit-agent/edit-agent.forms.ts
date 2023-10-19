import { FormControl, FormGroup } from "@angular/forms"

export type AgentFormModel = FormGroup<{
  userId: FormControl<number>
  agentName: FormControl<string>
  token: FormControl<string>
  cpuOnly: FormControl<number>
  cmdPars: FormControl<string>
  ignoreErrors: FormControl<number>
  isTrusted: FormControl<boolean>
  isActive: FormControl<boolean>
}>

export type AssignedTaskFormModel = FormGroup<{
  taskId: FormControl<number>
}>