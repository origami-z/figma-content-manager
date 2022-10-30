import { times150 } from "../utils";

test("1 times 150 equals 150", () => {
  expect(times150(1)).toEqual(150);
});

test("figma component resize api mock", () => {
  const component = figma.createComponent();
  component.resize(100, 100);
  expect(component.width).toEqual(100);
  expect(component.height).toEqual(100);
});
