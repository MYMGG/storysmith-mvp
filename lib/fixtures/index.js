import { makePart1Fixture } from "./part1.js";
import { makePart2Fixture } from "./part2.js";
import { makeFinalFixture } from "./final.js";

export const FIXTURE_BUILDERS = {
	Part1: makePart1Fixture,
	Part2: makePart2Fixture,
	Final: makeFinalFixture,
};
