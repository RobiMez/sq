<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { StepState, type IQuestClient } from '../../types/quest';
	import { expoInOut } from 'svelte/easing';
	import { Confetti } from 'svelte-confetti';
	import { get } from 'mongoose';
	import { createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';

	export let i: number;
	export let quest: IQuestClient;
	export let quests: IQuestClient[];

	let disableCloneButton = false;
	$: if (browser) {
		disableCloneButton = quest.cloners.includes(localStorage.getItem('uuid') ?? '');
	}

	let questUpdating = false;

	let tweenedQuestProgress = tweened(quest.progress, {
		duration: 900,
		easing: expoInOut
	});

	let showConfetti = false;
	$: tweenedQuestProgress.set(quest.progress);
	const dispatch = createEventDispatcher();

	async function handleClone(event: any, i: number) {
		const checked = event.target.checked;
		// alter quest to flip the state of the ith step to complete

		quests[i].public = checked;
		console.log('quests[i]', quests[i]);

		const response = await fetch('/api/qc', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ quest: quests[i], uid: localStorage.getItem('uuid') })
		});

		const resp = await response.json();

		if (resp.error) {
			console.log(resp.message);
		} else {
			if (resp.body) {
				quest = resp.body;
				quests[i] = resp.body;
			}
			dispatch('refreshPlz');
		}
	}

	async function handlePublicityChange(event: any, i: number) {
		const checked = event.target.checked;
		// alter quest to flip the state of the ith step to complete

		quests[i].public = checked;
		console.log('quests[i]', quests[i]);

		const response = await fetch('/api/qs', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ quest: quests[i] })
		});

		const resp = await response.json();

		if (resp.error) {
			console.log(resp.message);
		} else {
			console.log(resp);
			quest = resp.body;
			quests[i] = resp.body;
		}
	}

	async function handleCheckboxClick(event: any, i: number) {
		const checked = event.target.checked;
		// alter quest to flip the state of the ith step to complete
		if (checked) {
			quest.steps[i].state = StepState.Completed;
		} else {
			quest.steps[i].state = StepState.NotStarted;
		}
		// Update progress
		quest.progress =
			(quest.steps.filter((step) => step.state === StepState.Completed).length /
				quest.steps.length) *
			100;

		if (quest.progress === 100) {
			setTimeout(() => {
				showConfetti = true;
			}, 400);
		} else {
			showConfetti = false;
		}

		questUpdating = true;
		const response = await fetch('/api/q', {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ quest })
		});

		const resp = await response.json();

		if (resp.error) {
			console.log(resp.message);
		} else {
			quest = resp.body;
			questUpdating = false;
		}
	}
</script>

<div class=" relative w-full transform border-2 border-black bg-stone-50 p-4 transition-all">
	{#if showConfetti}
		<div
			class="absolute -top-3 h-[105%] w-full -translate-x-4 transform"
			style="
 display: flex;
 justify-content: center;
 pointer-events: none;"
		>
			<Confetti
				size={20}
				x={[-3.9, 3.9]}
				y={[-0.4, 0.9]}
				colorArray={['#ffcdb2', '#ffb4a2', '#e5989b', '#5d576b', '#70798c']}
				amount={30}
				delay={[200, 600]}
				fallDistance="290px"
			/>
			<Confetti
				size={20}
				x={[-3, 3]}
				y={[-0.4, 0.9]}
				colorArray={['#ffcdb2', '#ffb4a2', '#e5989b', '#5d576b', '#70798c']}
				amount={38}
				delay={[600, 800]}
				fallDistance="290px"
			/>

			<Confetti
				x={[-3, 3]}
				size={14}
				y={[0.3, 0.8]}
				colorArray={['#5d576b', '#70798c']}
				rounded
				amount={40}
				delay={[0, 2000]}
				fallDistance="400px"
			/>
		</div>
	{/if}
	<div class="absolute -right-4 -top-4 flex w-[103%] flex-row gap-4">
		<progress
			class="progress-stone progress w-full bg-stone-200"
			value={$tweenedQuestProgress ?? 0}
			max="100"
		></progress>

		<div class=" flex flex-row gap-1 border border-black bg-stone-100 p-1">
			{#each quest.tags as tag}
				<span class="whitespace-nowrap border border-black p-1 px-2 text-xs capitalize">{tag}</span>
			{/each}
		</div>
	</div>

	<div>
		<h2 class="pt-4 text-2xl font-bold text-stone-700">{quest.title}</h2>
		<p class="pt-1 text-sm font-light">{quest.time}</p>
	</div>

	<div class="flex flex-col gap-1 pt-3">
		{#each quest.steps as step, i}
			<div class="flex flex-row items-center justify-start gap-2">
				<input
					on:click={(e) => {
						handleCheckboxClick(e, i);
					}}
					type="checkbox"
					checked={step.state === StepState.Completed}
					disabled={questUpdating || quest.public}
					class="checkbox checkbox-sm"
				/>
				{step.description}
			</div>
		{/each}

		{#if quest.uid === localStorage.getItem('uuid')}
			<div class="flex flex-row items-center justify-start gap-2 pt-2">
				<input
					type="checkbox"
					class="toggle toggle-xs"
					checked={quest.public ?? false}
					on:click={async (e) => {
						await handlePublicityChange(e, i);
					}}
				/>
				<small>Set {quest.public ? 'Private' : 'Public'}</small>
			</div>
		{/if}
		<div class="flex flex-row items-center justify-start gap-2 pt-2">
			{#if quest.public}
				<button
					class="btn btn-outline btn-xs w-fit self-end"
					disabled={disableCloneButton}
					on:click={async (e) => {
						await handleClone(e, i);
					}}
					>{disableCloneButton ? 'Cloned' : 'Clone'}
				</button>
			{/if}
			<small class="whitespace-nowrap border border-black px-1"
				>{quest.public ? 'Public' : 'Private'}</small
			>

			<small class="whitespace-nowrap text-xs font-light">
				{quest.uid === 'PUBLIC'
					? ' '
					: quest.uid === localStorage.getItem('uuid')
					? 'By : Me'
					: `By: ${quest.uid.slice(2, 6)}`}</small
			>

			<small class="whitespace-nowrap"
				>{quest.cloners.length} Cloner{quest.cloners.length == 1 ? '' : 's'}
			</small>
			<div class="flex w-full flex-row gap-2 overflow-hidden">
				{#each quest.cloners as cloner}
					<small class="whitespace-nowrap border border-black px-1">
						{cloner.slice(2, 6)}
					</small>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.progress-stone::-moz-progress-bar {
		border-radius: var(--rounded-box, 1rem /* 16px */);
		--tw-bg-opacity: 1;
		background-color: rgb(87 83 78 / var(--tw-bg-opacity));
	}
	.progress-stone:indeterminate {
		background-color: rgb(87 83 78 / var(--tw-bg-opacity));
	}
	.progress-stone::-webkit-progress-value {
		--tw-bg-opacity: 1;
		background-color: rgb(87 83 78 / var(--tw-bg-opacity));
	}
</style>
