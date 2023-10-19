import { faAlignJustify, faIdBadge, faComputer, faKey, faInfoCircle, faEye } from '@fortawesome/free-solid-svg-icons'
import { faLinux, faWindows, faApple } from '@fortawesome/free-brands-svg-icons'
import { FormBuilder, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { ASC } from '../../core/_constants/agentsc.config'
import Swal from 'sweetalert2/dist/sweetalert2.js'
import { Observable, Subscription, forkJoin } from 'rxjs'
import { GlobalService } from 'src/app/core/_services/main.service'
import { environment } from './../../../environments/environment'
import { PageTitle } from 'src/app/core/_decorators/autotitle'
import { SERV } from '../../core/_services/main.config'
import { Agent, AgentStats } from 'src/app/core/_models/agents'
import { Task } from 'src/app/core/_models/task'
import { ListResponseWrapper } from 'src/app/core/_models/response'
import { User } from 'src/app/core/_models/user.model'
import { Chunk } from 'src/app/core/_models/chunk'
import { AgentFormModel, AssignedTaskFormModel } from './edit-agent.forms'

@Component({
  selector: 'app-edit-agent',
  templateUrl: './edit-agent.component.html'
})
@PageTitle(['Edit Agent'])
export class EditAgentComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = []

  agent!: Agent

  faAlignJustify = faAlignJustify
  faInfoCircle = faInfoCircle
  faComputer = faComputer
  faIdBadge = faIdBadge
  faWindows = faWindows
  faLinux = faLinux
  faApple = faApple
  faKey = faKey
  faEye = faEye

  temperatureData: AgentStats[] = []
  gpuUtilData: AgentStats[] = []
  cpuUtilData: AgentStats[] = []

  assignedTaskForm!: AssignedTaskFormModel
  form!: AgentFormModel

  assignTasks: Task[] = []
  users: User[] = []

  assignedTaskId: number

  chunks: Chunk[]

  timespent: number

  private maxResults = environment.config.prodApiMaxResults

  constructor(
    private route: ActivatedRoute,
    private gs: GlobalService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    this.setupForm()
  }

  ngOnInit(): void {
    this.subscriptions.push(this.route.data.subscribe(({ agent }) => {
      this.agent = agent
      this.updateForm()
      this.loadAllTasks()
      this.loadAssignedTasks()
      this.setAgentStats()
      this.loadChunks()
      this.loadUsers()
    }))
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe()
    }
  }

  setupForm(): void {
    this.form = this.fb.group({
      isActive: [false, Validators.required],
      userId: [0],
      agentName: ['', Validators.required],
      token: [''],
      cpuOnly: [0],
      cmdPars: [''],
      ignoreErrors: [0],
      isTrusted: [false],
    })
    this.assignedTaskForm = this.fb.group({
      taskId: [0]
    })
  }

  loadUsers(): void {
    const params = { 'maxResults': this.maxResults }
    this.subscriptions.push(this.gs.getAll(SERV.USERS, params).subscribe((response: ListResponseWrapper<User>) => {
      this.users = response.values
    }))
  }

  loadAllTasks(): void {
    const params = { 'maxResults': this.maxResults, 'filter': 'isArchived=false' }
    this.subscriptions.push(this.gs.getAll(SERV.TASKS, params).subscribe((response: ListResponseWrapper<Task>) => {
      this.assignTasks = response.values.filter(task => task.keyspaceProgress < task.keyspace || Number(task.keyspaceProgress) === 0) //Remove completed tasks
    }))
  }

  calculateTimeSpent(chunks: Chunk[]): void {
    const times = []
    if (chunks.length) {
      for (let i = 0; i < chunks.length; i++) {
        times.push(Math.max(chunks[i].solveTime, chunks[i].dispatchTime) - chunks[i].dispatchTime)
      }
      this.timespent = times.reduce((a, i) => a + i)
    }
  }

  loadChunks(): void {
    const params = { 'maxResults': 999999 }

    const chunks$ = this.gs.getAll(SERV.CHUNKS, params) // TODO: Expand task in backend
    const tasks$ = this.gs.getAll(SERV.TASKS, params)

    this.subscriptions.push(forkJoin([chunks$, tasks$]).subscribe(([c, t]: [ListResponseWrapper<Chunk>, ListResponseWrapper<Task>]) => {
      const assignedChunks = c.values.filter((chunk: Chunk) => chunk.agentId == this.agent._id)
      this.chunks = assignedChunks.map((chunk: Chunk) => {
        chunk.task = t.values.find((e: Task) => e.taskId === chunk.taskId)

        return chunk;
      })

      this.calculateTimeSpent(this.chunks)
    }))
  }


  getChunks(dataTablesSettings: any, callback: any, gs: GlobalService): void {
    console.log('tjo')

    const params = { 'maxResults': 999999 }

    const chunks$ = gs.getAll(SERV.CHUNKS, params) // TODO: Expand task in backend
    const tasks$ = gs.getAll(SERV.TASKS, params)

    forkJoin([chunks$, tasks$]).subscribe(([c, t]: [ListResponseWrapper<Chunk>, ListResponseWrapper<Task>]) => {
      const assignedChunks = c.values.filter((chunk: Chunk) => chunk.agentId == this.agent._id)
      assignedChunks.map((chunk: Chunk) => {
        chunk.task = t.values.find((e: Task) => e.taskId === chunk.taskId)

        return chunk;
      })
      callback({
        recordsTotal: assignedChunks.length,
        recordsFiltered: assignedChunks.length,
        data: assignedChunks
      })
    })
  }


  onSubmit() {
    if (this.form.valid) {
      this.subscriptions.push(this.gs.update(SERV.AGENTS, this.agent._id, this.form.value).subscribe(() => {
        this.assignOrUnassignTask()
        Swal.fire({
          position: 'top-end',
          backdrop: false,
          icon: 'success',
          title: "Saved",
          showConfirmButton: false,
          timer: 1500
        })
        this.form.reset() // success, we reset form
        this.router.navigate(['agents/show-agents'])
      }))
    }
  }

  assignOrUnassignTask(): void {
    const selectedTaskId = this.assignedTaskForm.get('taskId').value
    if (selectedTaskId) {
      if (this.hasAssignedTask && selectedTaskId !== this.assignedTaskId) {
        this.unassignTask()
      }
      this.assignTask(selectedTaskId)
    } else if (selectedTaskId === 0 && this.hasAssignedTask) {
      this.unassignTask()
    }
  }

  updateForm() {
    this.form.patchValue({
      'isActive': this.agent.isActive,
      'userId': this.agent.userId,
      'agentName': this.agent.agentName,
      'token': this.agent.token,
      'cpuOnly': this.agent.cpuOnly,
      'cmdPars': this.agent.cmdPars,
      'ignoreErrors': this.agent.ignoreErrors,
      'isTrusted': this.agent.isTrusted
    })
    this.assignedTaskForm.patchValue({
      'taskId': this.assignedTaskId || 0
    })
  }

  loadAssignedTasks(): void {
    const params = { 'filter': `agentId=${this.agent._id}` }
    this.subscriptions.push(this.gs.getAll(SERV.AGENT_ASSIGN, params).subscribe((response: ListResponseWrapper<any>) => {
      if (response.values.length) {
        this.assignedTaskId = response.values[0]['assignmentId']
        this.assignedTaskForm.patchValue({
          taskId: response.values[0]['taskId'],
        })
      }
    }))
  }

  get hasAssignedTask(): boolean {
    return this.assignedTaskId !== undefined
  }

  assignTask(selectedTaskId: number): void {
    if (selectedTaskId) {
      const params = { agentId: this.agent._id, taskId: selectedTaskId }
      this.subscriptions.push(this.gs.create(SERV.AGENT_ASSIGN, params).subscribe(() => {
        this.assignedTaskId = selectedTaskId
      }))
    }
  }

  unassignTask(): void {
    this.subscriptions.push(this.gs.delete(SERV.AGENT_ASSIGN, this.assignedTaskId).subscribe(() => {
      this.assignedTaskId = undefined
    }))
  }

  setAgentStats(): void {
    this.temperatureData = this.agent.agentstats.filter(u => u.statType == ASC.GPU_TEMP)
    this.gpuUtilData = this.agent.agentstats.filter(u => u.statType == ASC.GPU_UTIL)
    this.cpuUtilData = this.agent.agentstats.filter(u => u.statType == ASC.CPU_UTIL)
  }

  formIsInvalid(): boolean {
    if (!this.form.valid) {
      return true
    }

    if (this.form.get('userId').value === this.agent.userId &&
      this.form.get('agentName').value === this.agent.agentName &&
      this.form.get('token').value === this.agent.token &&
      this.form.get('cpuOnly').value === this.agent.cpuOnly &&
      this.form.get('cmdPars').value === this.agent.cmdPars &&
      this.form.get('ignoreErrors').value === this.agent.ignoreErrors &&
      this.form.get('isTrusted').value === this.agent.isTrusted &&
      this.form.get('isActive').value === this.agent.isActive) {
      if (this.assignedTaskForm.get('taskId').value === 0) {
        if (this.assignedTaskId === undefined) {
          return true
        }
      } else {
        if (this.assignedTaskForm.get('taskId').value === this.assignedTaskId) {
          return true
        }
      }
    }

    return false
  }
}
