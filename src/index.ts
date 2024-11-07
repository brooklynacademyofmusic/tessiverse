import { app } from '@azure/functions';
import { planStep } from './functions/planStep';

app.setup({
    enableHttpStream: true,
});

app.http('emailToTessi', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: planStep
});
