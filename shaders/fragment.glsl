varying vec2 vUv;
uniform sampler2D gs_texture;

void main(){
    float gs = texture2D(gs_texture, vUv).r;
    float gs_map = (gs - 0.3) / (0.9 - 0.3);

    gl_FragColor = vec4(gs_map, gs_map, gs_map, 1.);
}