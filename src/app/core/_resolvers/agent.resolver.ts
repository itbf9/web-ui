import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { GlobalService } from '../_services/main.service';
import { SERV } from '../_services/main.config';
import { Agent } from '../_models/agents';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const agentResolver: ResolveFn<Agent> = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot) => {
    const params = { 'expand': 'agentstats,accessGroups' }

    return inject(GlobalService).get(SERV.AGENTS, Number(route.paramMap.get('id')), params);
};
