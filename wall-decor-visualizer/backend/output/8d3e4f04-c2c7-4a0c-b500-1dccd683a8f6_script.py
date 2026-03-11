OUTPUT_PATH = '/tmp/8d3e4f04-c2c7-4a0c-b500-1dccd683a8f6.glb'

import bpy

def create_wall_skeleton():
    """
    Reconstructs the structural skeleton of the wall based on provided dimensions:
    - Total Wall Height: 9'
    - Total Wall Width: 14'6" (7' opening area + 7'6" solid wall)
    - Opening Width: 7'
    - Opening Height: 8'
    - Gap above opening: 1'
    """
    
    # Clear existing objects in the scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    # Conversion factor from feet to meters (Blender default unit)
    ft_to_m = 0.3048

    # Dimensions
    wall_width_ft = 14.5  # 7' + 7.5'
    wall_height_ft = 9.0
    wall_thickness_ft = 0.5 # Standard wall thickness assumption
    
    opening_width_ft = 7.0
    opening_height_ft = 8.0

    # Convert to meters
    w = wall_width_ft * ft_to_m
    h = wall_height_ft * ft_to_m
    t = wall_thickness_ft * ft_to_m
    ow = opening_width_ft * ft_to_m
    oh = opening_height_ft * ft_to_m

    # 1. Create the Main Wall
    # Positioned so the bottom-left-front corner is at (0,0,0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(w/2, t/2, h/2))
    wall = bpy.context.active_object
    wall.name = "MainWall"
    wall.scale = (w, t, h)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 2. Create the Opening (Door/AC area)
    # Positioned at the left side (x=0) and bottom (z=0)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(ow/2, t/2, oh/2))
    opening_cutter = bpy.context.active_object
    opening_cutter.name = "Opening_Cutter"
    # Scale slightly thicker on Y to ensure a clean boolean cut
    opening_cutter.scale = (ow, t * 1.2, oh)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    # 3. Perform Boolean Subtraction
    bool_mod = wall.modifiers.new(name="CutOpening", type='BOOLEAN')
    bool_mod.object = opening_cutter
    bool_mod.operation = 'DIFFERENCE'
    
    # Apply the modifier
    bpy.context.view_layer.objects.active = wall
    bpy.ops.object.modifier_apply(modifier=bool_mod.name)

    # 4. Clean up the cutter object
    bpy.data.objects.remove(opening_cutter, do_unlink=True)

    # 5. Export to GLB
    # Headless blender will save this to the current working directory
    bpy.ops.export_scene.gltf(
        filepath='/tmp/8d3e4f04-c2c7-4a0c-b500-1dccd683a8f6.glb', 
        export_format='GLB', 
        use_selection=False
    )

# Execute the function directly as requested
create_wall_skeleton()