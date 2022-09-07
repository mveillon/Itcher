import { Pitch } from "../src/baseballLogic/Pitch";

test('json', () => {
    const p = new Pitch('4-seam');
    const thereAndBack = Pitch.fromObj(p.toObj());
    expect(thereAndBack instanceof Pitch).toBe(true);
    expect(thereAndBack.name).toBe(p.name);
    expect(thereAndBack.heatmap).toEqual(p.heatmap);
    expect(thereAndBack.spinDirection).toBe(p.spinDirection);
    expect(thereAndBack.spinRate).toBe(p.spinRate);
    expect(thereAndBack.timesThrown).toBe(p.timesThrown);
    expect(thereAndBack.velo).toBe(p.velo);
});