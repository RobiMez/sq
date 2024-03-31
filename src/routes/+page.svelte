<script lang="ts">
	import { onMount } from 'svelte';
	import type { IQuestClient } from '../types/quest';
	import Card from './_components/Card.svelte';

	let quests: IQuestClient[] = [];
	let vagueQuest = '';
	let stagedQuest: IQuestClient;
	let uuid: string;
	let loadingQuests = false;
	let hideOriginals = false;

	const apiCall = async () => {
		loadingQuests = true;
		const response = await fetch(
			justMine ? `/api/q?uid=${uuid}&mine=true` : `/api/q?uid=${uuid}&mine=false`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		const resp = await response.json();

		if (resp.error) {
			console.log(resp.message);
		} else {
			console.log('resp', resp);
			loadingQuests = false;
			quests = resp.body;
		}
	};

	let generatingQuest = false;
	let hideCompleted = false;
	const generateQuest = async () => {
		generatingQuest = true;
		const response = await fetch('/api/q', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				description: vagueQuest,
				uid: uuid
			})
		});

		const resp = await response.json();

		if (resp.error) {
			console.log(resp.message);
		} else {
			generatingQuest = false;
			console.log(resp);
			await apiCall();
			quests = quests;

			vagueQuest = '';
			stagedQuest = resp.body;
		}
	};

	let justMine = false;

	const GenerateUUID = async () => {
		const baseUsername = 'user';
		const randomNumber = Math.floor(Math.random() * 10000);
		const username = `${baseUsername}-${randomNumber}`;

		const response = await fetch('/api/u', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username
			})
		});

		const resp = await response.json();

		if (resp.error) {
			console.log(resp.message);
		} else {
			console.log('resp', resp);
			localStorage.setItem('uuid', resp.body.userId);
		}
	};
	const handleMineChange = async (e: any) => {
		if (!uuid) return;
		if (!e.target) return;
		justMine = e.target.checked;
		await apiCall();
	};

	onMount(async () => {
		if (!localStorage.getItem('uuid')) await GenerateUUID();
		uuid = localStorage.getItem('uuid') ?? '';
		await apiCall();
	});
	// TODO: Need a staging system where a user can accept or modify the quest
</script>

<div
	class="container mx-auto flex h-full w-full max-w-4xl flex-grow flex-col items-center justify-start px-12"
>
	<div class="flex w-full flex-col gap-1 bg-stone-100 px-4">
		<h1 class="py-6 text-3xl font-extralight text-stone-600 lg:text-5xl">Welcome to Side Quests</h1>
		<div class="flex flex-row items-center justify-start gap-2 py-1">
			<input
				type="checkbox"
				class="toggle toggle-xs"
				bind:checked={justMine}
				on:click={handleMineChange}
			/>
			<small class="whitespace-nowrap"> Just mine </small>
			<input type="checkbox" class="toggle toggle-xs" bind:checked={hideCompleted} />
			<small class="whitespace-nowrap"> Hide done </small>
			<input type="checkbox" class="toggle toggle-xs" bind:checked={hideOriginals} />
			<small class="whitespace-nowrap"> Hide originals </small>
			{#if loadingQuests}
				<small> Refreshing ... </small>
			{/if}
		</div>
		<div class="flex w-full flex-row items-center justify-center gap-4 py-2 pb-12">
			<input
				bind:value={vagueQuest}
				type="text"
				class="input input-sm input-bordered w-full rounded-none"
				placeholder="I want to ... "
				on:keydown={(e) => e.key === 'Enter' && vagueQuest.trim().length > 0 && generateQuest()}
			/>
			<button
				class="btn btn-sm rounded-none border border-black disabled:border-stone-700"
				disabled={vagueQuest.trim().length <= 0 || generatingQuest}
				on:click={generateQuest}
			>
				{#if generatingQuest}
					Generating Quest 🧙‍♂️
				{:else}
					Generate Quest ✨
				{/if}
			</button>
		</div>
	</div>

	<div class="flex w-full flex-col gap-8 py-12">
		{#key quests}
			{#each quests as quest, i}
				{#key hideCompleted}
					{#if hideCompleted}
						{#if quest.progress !== 100}
							<Card
								on:refreshPlz={async () => {
									await apiCall();
								}}
								{quest}
								{quests}
								{i}
							/>
						{/if}
					{:else if hideOriginals}
						{#if !quest.cloners.find((c) => c === localStorage.getItem('uuid'))}
							<Card
								on:refreshPlz={async () => {
									await apiCall();
								}}
								{quest}
								{quests}
								{i}
							/>
						{/if}
					{:else}
						<Card
							on:refreshPlz={async () => {
								await apiCall();
							}}
							{quest}
							{quests}
							{i}
						/>
					{/if}
				{/key}
			{/each}
		{/key}
	</div>
</div>
